#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPORT_DIR="$ROOT_DIR/ops/reports/qa"
JSON_REPORT="$REPORT_DIR/live-smoke.json"
MD_REPORT="$REPORT_DIR/live-smoke.md"
APP_URL="${APP_URL:-http://127.0.0.1:3000}"

mkdir -p "$REPORT_DIR"

timestamp_utc="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
failures=()
notes=()

record_failure() {
  failures+=("$1")
}

record_note() {
  notes+=("$1")
}

json_array_from_list() {
  if (( $# == 0 )); then
    echo '[]'
  else
    printf '%s\n' "$@" | jq -R . | jq -s .
  fi
}

check_health() {
  local code status
  code="$(curl -sS -o /tmp/harya_health.json -w "%{http_code}" "$APP_URL/api/health" || true)"
  status="$(jq -r '.status // "unknown"' /tmp/harya_health.json 2>/dev/null || echo unknown)"

  [[ "$code" == "200" ]] || record_failure "api_health_http_$code"
  [[ "$status" == "ok" ]] || record_failure "api_health_status_$status"
  record_note "health_http=$code"
}

check_home_page() {
  local code html
  code="$(curl -sS -o /tmp/harya_home.html -w "%{http_code}" "$APP_URL" || true)"
  html="$(cat /tmp/harya_home.html 2>/dev/null || true)"

  [[ "$code" == "200" ]] || record_failure "home_http_$code"
  grep -q "H-Arya" <<<"$html" || record_failure "home_missing_brand"
  grep -q "Create Account" <<<"$html" || record_failure "home_missing_create_account"
  grep -q "Log In" <<<"$html" || record_failure "home_missing_login"
}

check_browser_snapshot() {
  if ! openclaw browser start >/dev/null 2>&1; then
    record_failure "browser_start_failed"
    return
  fi

  if ! openclaw browser navigate "$APP_URL" >/dev/null 2>&1; then
    record_failure "browser_navigate_failed"
    return
  fi

  local aria
  if ! aria="$(openclaw browser snapshot --format aria --limit 260 2>/dev/null)"; then
    record_failure "browser_snapshot_failed"
    return
  fi

  grep -q 'RootWebArea "H-Arya"' <<<"$aria" || record_failure "browser_missing_root_web_area"
  grep -q 'link "Create Account"' <<<"$aria" || record_failure "browser_missing_create_account_link"
  grep -q 'link "Log In"' <<<"$aria" || record_failure "browser_missing_login_link"
}

check_science_content_mapping() {
  local science_rows
  if [[ ! -f "$ROOT_DIR/.env" ]]; then
    record_failure "env_missing"
    return
  fi

  # shellcheck disable=SC1091
  set -a; source "$ROOT_DIR/.env"; set +a

  if [[ -z "${POSTGRES_PASSWORD:-}" ]]; then
    record_failure "postgres_password_missing"
    return
  fi

  science_rows="$(docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" h-arya-db psql -U postgres -d h_arya -Atc "select id,chapter_number from curriculum where grade=7 and subject='Science' and is_active=true order by chapter_number;" 2>/dev/null || true)"

  if [[ -z "$science_rows" ]]; then
    record_failure "science_curriculum_empty"
    return
  fi

  local id num code subject error
  while IFS='|' read -r id num; do
    [[ -n "$id" ]] || continue
    code="$(curl -sS -o /tmp/harya_content_${id}.json -w "%{http_code}" "$APP_URL/api/content/$id" || true)"
    subject="$(jq -r '.metadata.subject // .expectedSubject // "NA"' /tmp/harya_content_${id}.json 2>/dev/null || echo NA)"
    error="$(jq -r '.error // "ok"' /tmp/harya_content_${id}.json 2>/dev/null || echo ok)"

    if [[ "$code" == "200" ]]; then
      [[ "$subject" == "Science" ]] || record_failure "science_subject_mismatch_ch${num}_$subject"
    elif [[ "$code" == "404" ]]; then
      record_failure "science_chapter_${num}_missing_content"
      record_note "science_chapter_${num}_missing_content:$error"
    else
      record_failure "science_content_http_${code}_ch${num}"
    fi
  done <<< "$science_rows"
}

check_curriculum_endpoint() {
  local code count
  code="$(curl -sS -o /tmp/harya_curriculum.json -w "%{http_code}" "$APP_URL/api/curriculum?grade=7" || true)"
  count="$(jq -r '.chapters|length' /tmp/harya_curriculum.json 2>/dev/null || echo 0)"

  [[ "$code" == "200" ]] || record_failure "curriculum_http_$code"
  [[ "$count" =~ ^[0-9]+$ ]] || count=0
  (( count > 0 )) || record_failure "curriculum_empty"
  record_note "curriculum_count=$count"
}

check_health
check_home_page
check_curriculum_endpoint
check_science_content_mapping
check_browser_snapshot

status="pass"
exit_code=0
if (( ${#failures[@]} > 0 )); then
  status="fail"
  exit_code=2
fi

failures_json="$(json_array_from_list "${failures[@]}")"
notes_json="$(json_array_from_list "${notes[@]}")"

jq -n \
  --arg ts "$timestamp_utc" \
  --arg status "$status" \
  --arg app_url "$APP_URL" \
  --argjson failures "$failures_json" \
  --argjson notes "$notes_json" \
  '{
    timestamp_utc: $ts,
    status: $status,
    app_url: $app_url,
    failure_count: ($failures | length),
    note_count: ($notes | length),
    failures: $failures,
    notes: $notes
  }' > "$JSON_REPORT"

{
  echo "# Live Smoke QA"
  echo
  echo "- timestamp_utc: $timestamp_utc"
  echo "- status: $status"
  echo "- app_url: $APP_URL"
  echo "- failure_count: ${#failures[@]}"
  echo "- note_count: ${#notes[@]}"
  echo
  echo "## Failures"
  if (( ${#failures[@]} == 0 )); then
    echo "- none"
  else
    for f in "${failures[@]}"; do echo "- $f"; done
  fi
  echo
  echo "## Notes"
  if (( ${#notes[@]} == 0 )); then
    echo "- none"
  else
    for n in "${notes[@]}"; do echo "- $n"; done
  fi
} > "$MD_REPORT"

echo "wrote: $JSON_REPORT"
echo "wrote: $MD_REPORT"
cat "$JSON_REPORT"

exit "$exit_code"
