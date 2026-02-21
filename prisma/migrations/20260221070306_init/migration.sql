-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "grade" INTEGER NOT NULL DEFAULT 7,
    "board" TEXT NOT NULL DEFAULT 'Maharashtra',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "subject" TEXT,
    "chapter" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMP(3),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "chapter" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "answers" JSONB NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "total" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "chapter" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "mastery_level" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_practiced" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "current_stage" INTEGER NOT NULL DEFAULT 1,
    "stages_completed" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum" (
    "id" SERIAL NOT NULL,
    "subject" TEXT NOT NULL,
    "chapter_number" INTEGER NOT NULL,
    "chapter_name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "curriculum_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "progress_user_id_subject_chapter_key" ON "progress"("user_id", "subject", "chapter");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_subject_chapter_number_key" ON "curriculum"("subject", "chapter_number");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress" ADD CONSTRAINT "progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
