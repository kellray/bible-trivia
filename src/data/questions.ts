// ─────────────────────────────────────────────────────────────
//  Bible Trivia — Question Bank
//  Source: New World Translation (NWT) — jw.org
//  5+ questions per category (20 total minimum)
// ─────────────────────────────────────────────────────────────

import { Question } from '@/types/game';

export const questions: Question[] = [
  // ══════════════════════════════════════
  //  CATEGORY: Kings of Israel
  // ══════════════════════════════════════
  {
    id: 'koi-1',
    category: 'Kings of Israel',
    question: 'Who was the first king of Israel?',
    options: ['David', 'Saul', 'Solomon'],
    answer: 'Saul',
    reference: '1 Samuel 10:24 (NWT)',
  },
  {
    id: 'koi-2',
    category: 'Kings of Israel',
    question: 'Which king is credited with building the first temple in Jerusalem?',
    options: ['David', 'Rehoboam', 'Solomon'],
    answer: 'Solomon',
    reference: '1 Kings 6:1 (NWT)',
  },
  {
    id: 'koi-3',
    category: 'Kings of Israel',
    question: 'What did young David use to defeat the Philistine giant Goliath?',
    options: ['A sword', 'A sling and a stone', 'A spear'],
    answer: 'A sling and a stone',
    reference: '1 Samuel 17:49 (NWT)',
  },
  {
    id: 'koi-4',
    category: 'Kings of Israel',
    question: 'Which king of Israel introduced Baal worship and "did more to offend Jehovah" than all before him?',
    options: ['Ahab', 'Jeroboam', 'Manasseh'],
    answer: 'Ahab',
    reference: '1 Kings 16:30, 33 (NWT)',
  },
  {
    id: 'koi-5',
    category: 'Kings of Israel',
    question: 'King Hezekiah prayed and Jehovah granted him how many additional years of life?',
    options: ['10 years', '15 years', '20 years'],
    answer: '15 years',
    reference: '2 Kings 20:6 (NWT)',
  },
  {
    id: 'koi-6',
    category: 'Kings of Israel',
    question: 'Which king tore his garments upon hearing the words of the book of the Law, showing great humility?',
    options: ['Josiah', 'Asa', 'Jehoshaphat'],
    answer: 'Josiah',
    reference: '2 Kings 22:11 (NWT)',
  },

  // ══════════════════════════════════════
  //  CATEGORY: Jesus Life
  // ══════════════════════════════════════
  {
    id: 'jl-1',
    category: 'Jesus Life',
    question: 'Where was Jesus baptized?',
    options: ['The Sea of Galilee', 'The Jordan River', 'The Dead Sea'],
    answer: 'The Jordan River',
    reference: 'Matthew 3:13 (NWT)',
  },
  {
    id: 'jl-2',
    category: 'Jesus Life',
    question: 'What was the first miracle Jesus performed, according to the Gospel of John?',
    options: ['Healing a blind man', 'Turning water into wine', 'Walking on water'],
    answer: 'Turning water into wine',
    reference: 'John 2:1–11 (NWT)',
  },
  {
    id: 'jl-3',
    category: 'Jesus Life',
    question: 'In the Sermon on the Mount, Jesus said: "Happy are the _______, for they will inherit the earth."',
    options: ['pure in heart', 'meek', 'merciful'],
    answer: 'meek',
    reference: 'Matthew 5:5 (NWT)',
  },
  {
    id: 'jl-4',
    category: 'Jesus Life',
    question: 'In Jesus\' parable, a father ran to meet which returning son?',
    options: ['The older son', 'The prodigal (lost) son', 'His firstborn son'],
    answer: 'The prodigal (lost) son',
    reference: 'Luke 15:20 (NWT)',
  },
  {
    id: 'jl-5',
    category: 'Jesus Life',
    question: 'On which day did Jesus rise from the dead?',
    options: ['The first day of the week', 'The third day after Passover', 'The Sabbath'],
    answer: 'The first day of the week',
    reference: 'Matthew 28:1–6 (NWT)',
  },
  {
    id: 'jl-6',
    category: 'Jesus Life',
    question: 'How many apostles did Jesus choose?',
    options: ['7', '10', '12'],
    answer: '12',
    reference: 'Luke 6:13 (NWT)',
  },

  // ══════════════════════════════════════
  //  CATEGORY: The Israelites
  // ══════════════════════════════════════
  {
    id: 'ti-1',
    category: 'The Israelites',
    question: 'How many years did the Israelites wander in the wilderness?',
    options: ['20 years', '40 years', '50 years'],
    answer: '40 years',
    reference: 'Numbers 14:33 (NWT)',
  },
  {
    id: 'ti-2',
    category: 'The Israelites',
    question: 'What did Jehovah provide as food for the Israelites in the wilderness?',
    options: ['Bread and fish', 'Manna and quail', 'Dates and figs'],
    answer: 'Manna and quail',
    reference: 'Exodus 16:13–15 (NWT)',
  },
  {
    id: 'ti-3',
    category: 'The Israelites',
    question: 'Which judge led 300 men to defeat the Midianites?',
    options: ['Samson', 'Gideon', 'Deborah'],
    answer: 'Gideon',
    reference: 'Judges 7:7 (NWT)',
  },
  {
    id: 'ti-4',
    category: 'The Israelites',
    question: 'Who led the Israelites across the Jordan River into the Promised Land after Moses died?',
    options: ['Caleb', 'Aaron', 'Joshua'],
    answer: 'Joshua',
    reference: 'Joshua 3:17 (NWT)',
  },
  {
    id: 'ti-5',
    category: 'The Israelites',
    question: 'What was housed inside the tabernacle\'s Most Holy compartment?',
    options: ['The bronze altar', 'The ark of the covenant', 'The golden lampstand'],
    answer: 'The ark of the covenant',
    reference: 'Exodus 26:33–34 (NWT)',
  },
  {
    id: 'ti-6',
    category: 'The Israelites',
    question: 'How many plagues did Jehovah bring upon Egypt before Pharaoh let Israel go?',
    options: ['7', '10', '12'],
    answer: '10',
    reference: 'Exodus 7–12 (NWT)',
  },

  // ══════════════════════════════════════
  //  CATEGORY: First Century Christians
  // ══════════════════════════════════════
  {
    id: 'fcc-1',
    category: 'First Century Christians',
    question: 'On what occasion were approximately 3,000 people baptized in one day in Jerusalem?',
    options: ['The Passover', 'Pentecost', 'The Festival of Booths'],
    answer: 'Pentecost',
    reference: 'Acts 2:41 (NWT)',
  },
  {
    id: 'fcc-2',
    category: 'First Century Christians',
    question: 'Paul\'s letter to the Romans opens with him identifying himself as "a slave of Christ Jesus, called to be an ______."',
    options: ['elder', 'apostle', 'prophet'],
    answer: 'apostle',
    reference: 'Romans 1:1 (NWT)',
  },
  {
    id: 'fcc-3',
    category: 'First Century Christians',
    question: 'In Acts, who was the first Christian martyr, stoned to death for his bold speech?',
    options: ['Philip', 'Stephen', 'James'],
    answer: 'Stephen',
    reference: 'Acts 7:59–60 (NWT)',
  },
  {
    id: 'fcc-4',
    category: 'First Century Christians',
    question: 'Paul wrote that "love is ______; love is kind" in his letter to the Corinthians.',
    options: ['patient', 'gentle', 'joyful'],
    answer: 'patient',
    reference: '1 Corinthians 13:4 (NWT)',
  },
  {
    id: 'fcc-5',
    category: 'First Century Christians',
    question: 'Which city congregation received a letter from Paul in which he famously wrote about "the armor of God"?',
    options: ['Corinth', 'Philippi', 'Ephesus'],
    answer: 'Ephesus',
    reference: 'Ephesians 6:11 (NWT)',
  },
  {
    id: 'fcc-6',
    category: 'First Century Christians',
    question: 'According to Acts 11:26, disciples were first called Christians in which city?',
    options: ['Jerusalem', 'Antioch', 'Rome'],
    answer: 'Antioch',
    reference: 'Acts 11:26 (NWT)',
  },
];

export const CATEGORIES = [
  'Kings of Israel',
  'Jesus Life',
  'The Israelites',
  'First Century Christians',
] as const;

export function getQuestionsByCategory(category: string): Question[] {
  return questions.filter((q) => q.category === category);
}

export function getRandomQuestion(category: string, usedIds: string[] = []): Question | null {
  const pool = getQuestionsByCategory(category).filter((q) => !usedIds.includes(q.id));
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
