var express = require('express');
const fs = require('fs')

var app = express();

app.use(express.json())

app.get('/swagger', function (req, res) {
   res.status(200).send('Active');
})


// Post - Insert method
app.post('/', (req, res) => {
   //get the existing book
   const existBooks = getBookData()
   
   //get the new book data from post request
   const bookData = req.body

   //check if the book title missing
   if (bookData.book == null) {
       return res.status(400).json({error: true, msg: 'Invalid parameters'})
   }
   if (bookData.book.trim() == "") {
       return res.status(400).json({error: true, msg: 'Book data missing'})
   }
   
   //check for duplicate book
   const findExist = checkDuplicateBookData(existBooks, bookData.book)
   if (findExist) {
       return res.status(409).json({error: true, msg: 'Book already exist'})
   }

   //add the new book data
   existBooks.push(bookData)

   //save the new book data
   saveBookData(existBooks);
   res.json({success: true, msg: 'Book added successfully'})

})


// Delete - Delete method
app.delete('/:book', (req, res) => {
   var bookname = req.params.book
   //get the existing bookData
   const existBooks = getBookData()

   //filter the bookData to remove it
   const filterBook = existBooks.filter( data => data.book.toLowerCase() !== bookname.toLowerCase() )

   if ( existBooks.length === filterBook.length ) {
       return res.status(409).send({error: true, msg: 'bookname does not exist'})
   }

   //save the filtered data
   saveBookData(filterBook)

   res.send({success: true, msg: 'Book removed successfully'})
   
})


app.patch('/:original_book/:new_book', (req, res) => {
   //get the original book name and new book name from url
   const originalBook = req.params.original_book
   const newBook = req.params.new_book
   
   //get the existing books
   const existBooks = getBookData()

   //check if the original book exist or not       
   var findExist = checkDuplicateBookData(existBooks, originalBook)
   if (!findExist) {
       return res.status(409).send({error: true, msg: 'Original book does not exist'})
   }

   //check if the new book exist or not       
   var findExist = checkDuplicateBookData(existBooks, newBook)
   if (findExist) {
       return res.status(409).send({error: true, msg: 'Book already exist, choose different name'})
   }

   //filter the book
   const updateBook = existBooks.map(data => {
       if(data.book.toLowerCase() == originalBook.toLowerCase()){
           data.book = newBook
       }
       return data;
   })

   //finally save it
   saveBookData(updateBook)

   res.send({success: true, msg: 'Book data updated successfully'})
})

app.get('/', (req, res) =>{

   //get the existing books
   const existBooks = getBookData()

   if(existBooks.length == 0){
      res.send({error: true, msg: 'No books found'})
   }
    getBookList(existBooks,existBooks.length,booksWithDelimiter).then(allBooks => {
       res.send({"books": allBooks});
    })
});

async function getBookList (list, index, callback){
   var result = '';
   for(var i = 0; i< index; i++){
      if(i==0){
         result = result + list[i].book;
      }
      else{
         result = callback(list[i], result)
      }
   }
   return result;
}
 
function booksWithDelimiter(bookDetails, allbook){
   return  allbook + ', ' + bookDetails.book
}

// app.put("/", (req, res) => {

//    //get the existing books
//    const existBooks = getBookData()

//    if(existBooks.length == 0){
//       res.send({error: true, msg: 'No books found'})
//    }

   
// })

// async function saveItemOnDatabase (name, callback){
   
// }


// function generateRandom(len){
//    return Math.floor(Math.random() * 10)*len
// }







/* util functions */

//read the book data from json file
const saveBookData = (data) => {
   const stringifyData = JSON.stringify(data)
   fs.writeFileSync('books.json', stringifyData)
}

//get the book data from json file
const getBookData = () => {
   const jsonData = fs.readFileSync('books.json')
   return JSON.parse(jsonData)    
}

const checkDuplicateBookData = (Olddata, inputData) =>{
   var result = Olddata.filter( data => data.book.toLowerCase() !== inputData.toLowerCase());
   return !(result.length == Olddata.length)
}

/* util functions ends */

app.all('*', (req, res) => {
   res.status(404).send({"error": "Page not found"})
})

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})