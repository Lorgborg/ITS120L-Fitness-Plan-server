const getNationDate = () => {
    const now = new Date();
    return new Date(now.getTime() + 8 * 3600000); // Adding 8 hours for UTC+8 (PHT)
};


module.exports = getNationDate;