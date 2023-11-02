const mySqli = require('mysqli')

let connection = new mySqli({
    Host: 'localhost',
    post: 3306,
    user: 'root',
    passwd: '',
    db: 'mega_shop'
})


let db = connection.emit(false, '')

module.exports = {
    database: db
}