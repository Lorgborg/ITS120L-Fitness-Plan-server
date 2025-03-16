async function getDocumentsByDay(day, mail, collection) {
    try { 
       // Convert `day` to a valid Date object
       const startOfDay = new Date(day);
       startOfDay.setHours(0, 0, 0, 0);  // Set to beginning of the day
 
       const endOfDay = new Date(day);
       endOfDay.setHours(23, 59, 59, 999); // Set to end of the day
 
       // Query to find documents within the day
       const query = {
          email: mail,
          date: { $gte: startOfDay, $lte: endOfDay }
       };
 
       const results = await collection.find(query).toArray();
       console.log("Documents found:", results);
       return results;
    } catch (error) {
       console.error("Error fetching documents:", error);
    }
 }

module.exports = getDocumentsByDay;