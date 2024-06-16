const emailModel = require("../schemas/email");

const searchInEmails = async (data) => {
    const { searchQuery, page, limit, from, clientAgreed, startDate, endDate } = data;

    const skip = (page - 1) * limit;

    let fromFilter = {};
    if (from) {
        fromFilter = { from: request.userData.emailAddress };
    }

    let clientAgreedFilter = {};
    if (clientAgreed) {
        clientAgreedFilter = { clientAgreed: true };
    }

    let dateFilter = {};
    if (startDate && endDate) {
        dateFilter = { createdAt: { $gte: startDate, $lte: endDate } };
    }

    console.log(dateFilter)

    let searchQueryFilter = {};
    if(searchQuery) {
        searchQueryFilter = { $text: { $search: `"${searchQuery}"` } };
    }

    let query = emailModel
        .find({
            ...searchQueryFilter,
            ...fromFilter,
            ...clientAgreedFilter,
            ...dateFilter
        })
        .sort({ createdAt: -1 })

    if(limit) {
        query = query.skip(skip).limit(limit)
    }

    const docs = await query.exec();
    
    return docs;
}

module.exports = {
    searchInEmails
}