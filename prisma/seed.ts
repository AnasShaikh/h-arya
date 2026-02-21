import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing curriculum
  await prisma.curriculum.deleteMany();

  await prisma.curriculum.createMany({
    data: [
      // Science chapters
      { subject: 'Science', chapterNumber: 15, chapterName: 'Materials we Use',              description: 'Toothpaste, Detergents, Soap, Cement, Concrete',                                isActive: true },
      { subject: 'Science', chapterNumber: 17, chapterName: 'Effects of Light',              description: 'Scattering of Light, Shadows, Eclipses',                                       isActive: true },
      { subject: 'Science', chapterNumber: 18, chapterName: 'Sound',                         description: 'Production, Propagation, Pitch, Intensity',                                    isActive: true },
      { subject: 'Science', chapterNumber: 19, chapterName: 'Properties of a Magnetic Field',description: 'Magnetism, Magnetic Field, Properties of Magnetic Lines of Force',             isActive: true },
      { subject: 'Science', chapterNumber: 20, chapterName: 'In the World of Stars',         description: 'Galaxies, Stars, Constellations, Celestial Sphere, Nakshatras',               isActive: true },

      // Mathematics chapters
      { subject: 'Mathematics', chapterNumber: 1,  chapterName: 'Geometrical Constructions',               description: 'Angle bisectors, perpendicular bisectors, triangle constructions',           isActive: true },
      { subject: 'Mathematics', chapterNumber: 2,  chapterName: 'Multiplication and Division of Integers', description: 'Multiplying and dividing positive and negative integers',                   isActive: true },
      { subject: 'Mathematics', chapterNumber: 3,  chapterName: 'HCF and LCM',                             description: 'Prime factorisation, Highest Common Factor, Lowest Common Multiple',       isActive: true },
      { subject: 'Mathematics', chapterNumber: 4,  chapterName: 'Angles and Pairs of Angles',              description: 'Types of angles, complementary, supplementary, adjacent angles',           isActive: true },
      { subject: 'Mathematics', chapterNumber: 5,  chapterName: 'Operations on Rational Numbers',          description: 'Addition, subtraction, multiplication, division of rational numbers',      isActive: true },
      { subject: 'Mathematics', chapterNumber: 6,  chapterName: 'Indices',                                 description: 'Laws of indices, exponents, powers',                                      isActive: true },
      { subject: 'Mathematics', chapterNumber: 7,  chapterName: 'Joint Bar Graph',                         description: 'Reading and drawing joint/grouped bar graphs',                             isActive: true },
      { subject: 'Mathematics', chapterNumber: 8,  chapterName: 'Algebraic Expressions and Operations',    description: 'Terms, coefficients, addition and subtraction of expressions',              isActive: true },
      { subject: 'Mathematics', chapterNumber: 9,  chapterName: 'Direct and Inverse Proportion',           description: 'Direct proportion, inverse proportion, unitary method',                    isActive: true },
      { subject: 'Mathematics', chapterNumber: 10, chapterName: 'Banks and Simple Interest',               description: 'Savings, deposits, loans, simple interest calculation',                    isActive: true },
      { subject: 'Mathematics', chapterNumber: 11, chapterName: 'Circle',                                  description: 'Chord, arc, central angle, inscribed angle, cyclic quadrilateral',         isActive: true },
      { subject: 'Mathematics', chapterNumber: 12, chapterName: 'Perimeter and Area',                      description: 'Area of triangle, parallelogram, circle, combined figures',                isActive: true },
      { subject: 'Mathematics', chapterNumber: 13, chapterName: 'Pythagoras Theorem',                      description: 'Right-angled triangles, Pythagorean triplets, applications',               isActive: true },
      { subject: 'Mathematics', chapterNumber: 14, chapterName: 'Algebraic Formulae - Expansion of Squares', description: 'Identities: (a+b)², (a-b)², (a+b)(a-b)',                               isActive: true },
      { subject: 'Mathematics', chapterNumber: 15, chapterName: 'Statistics',                              description: 'Mean, median, mode, frequency tables, histograms',                        isActive: true },
    ],
  });

  console.log('Curriculum seeded successfully.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
