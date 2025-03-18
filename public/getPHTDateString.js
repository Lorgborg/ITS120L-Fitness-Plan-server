const getPHTDateString = (date) => {
    const options = { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" };
    return new Intl.DateTimeFormat("en-CA", options).format(date); // YYYY-MM-DD format
};

module.exports = getPHTDateString;