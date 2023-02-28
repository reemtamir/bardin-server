module.exports = getAge = (age) => {
  const year = age[0] + age[1] + age[2] + age[3];
  const month = age[5] + age[6];
  const day = age[8] + age[9];
  const birthdate = new Date(year, month, day);
  const now = Date.now();
  const diff = now - birthdate.getTime();
  const msInYear = 1000 * 60 * 60 * 24 * 365.25;
  const currentAge = Math.floor(diff / msInYear);
  return currentAge;
};
