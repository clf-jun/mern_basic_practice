const express = require('express');
const connectDB = require('./config/db');

const app = express();
//connectDB();

const database = [
    { id: 1, title: '글1'},
    { id: 2, title: '글2'},
    { id: 3, title: '글3'},
]
//app.get('/', (req, res) => res.send('API running') );
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
})

//내장 미들웨어에 의해 urlencoded가 body-parser 역할을 함
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server starts on port ${PORT}`));

app.get('/database', (req, res) => {
    res.send(database);
})

//url 뒤에 :객체명을 쓰면 params를 활용해서 값을 넣을 수 있음.
app.get('/database/:id', (req, res) => {
    const id = req.params.id; //받아온 값은 무조건 string이라 number로 변환해줘야함
    const data = database.find((el)=> el.id === Number(id));
    res.send(data);
})


//값을 입력할때는 req.body를 이용해서 주로 사용한다.(post 메소드 사용) express 내 body_parser 필요

app.post('/add-database', (req, res) => {
    const title = req.body.title;
    database.push({
        id: database.length + 1,
        title, 
    })
    res.send('값이 추가되었습니다.');
});

app.post('/update-database', (req, res) => {
    const id = req.body.id;
    const title = req.body.title;
    database[ id - 1].title = title;
    res.send('값이 수정되었습니다.');
});

app.post('/delete-database', (req, res) => {
    const id = req.body.id;
    database.splice(id - 1, 1);
    res.send('값이 삭제되었습니다.');
});





// app.use(express.json({
//     extended: false
// }));
// app.use('/api/user', require('./routes/api/user'));
// app.use('/api/auth', require('./routes/api/auth'));
// app.use('/api/post', require('./routes/api/posts'));
// app.use('/api/profile', require('./routes/api/profile'));