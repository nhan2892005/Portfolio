import { gradeToGPA, SPECIAL_SCORES } from "../constants";

// convert from 10-point to letter grade
export const scoreToGrade = (score) => {
  if (score >= 9.45) return "A+";
  if (score >= 8.45) return "A";
  if (score >= 7.95) return "B+";
  if (score >= 6.95) return "B";
  if (score >= 6.45) return "C+";
  if (score >= 5.45) return "C";
  if (score >= 4.95) return "D+";
  if (score >= 3.95) return "D";
  return "F";
};

// Calculate final score from its components
export const calculateCourseScore = (components) => {
  if (!components || components.length === 0) return null;
  
  const validComponents = components.filter(comp => comp.tyLe !== 100);
  
  if (validComponents.length === 0) return null;

  const totalWeight = validComponents.reduce((sum, comp) => sum + (comp.tyLe || 0), 0);
  
  if (totalWeight === 0) return null;
  
  const weightedSum = validComponents.reduce((sum, comp) => {
    return sum + (comp.diem || 0) * (comp.tyLe || 0);
  }, 0);
  
  const finalScore = weightedSum / totalWeight;
  
  const roundedScore = Math.ceil(finalScore * 10) / 10;
  const displayScore = Math.round(roundedScore * 100) / 100;
  
  return {
    score: displayScore,
    grade: scoreToGrade(finalScore),
    gpa: gradeToGPA[scoreToGrade(finalScore)],
    components: validComponents,
    totalWeight
  };
};

// Check a score if it is special letter grade
export const isSpecialScore = (diemChu, diemSo) => {
  
  if (SPECIAL_SCORES.hasOwnProperty(diemChu)) {
    return true;
  }
  
  if (typeof diemSo === 'number') {
    const specialCodes = Object.values(SPECIAL_SCORES).map(s => s.numericCode);
    return specialCodes.includes(diemSo);
  }
  
  return false;
};

// Get description of special letter grade
export const getSpecialScoreInfo = (diemChu, diemSo) => {
  if (SPECIAL_SCORES.hasOwnProperty(diemChu)) {
    return SPECIAL_SCORES[diemChu];
  }
  
  if (typeof diemSo === 'number') {
    const entry = Object.entries(SPECIAL_SCORES).find(([_, info]) => info.numericCode === diemSo);
    if (entry) {
      return { ...entry[1], displayCode: entry[0] };
    }
  }
  
  return null;
};