const jsonServer = require('json-server')
const fs = require('fs')
const server = jsonServer.create()
// const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()
const jwt = require('jsonwebtoken')
const path = require('path')
const router = jsonServer.router(path.join(__dirname, 'db.json'))

server.use(jsonServer.bodyParser);
server.use(middlewares);

const getUsersDb = () => {
    return JSON.parse(
        fs.readFileSync(path.join(__dirname, 'users.json'), 'UTF-8')
    );
}

const isAuthenticated = ({email, password}) => {
    return (
        getUsersDb().users.findIndex(user => user.email === email && user.password === password) !== -1
    );
};

const SECRET = '123123JIOJWEFsfse12323986';
const expiresIn = '1h';
const createToken = payload => {
    return(jwt.sign(payload, SECRET, {expiresIn}));
}

server.post("/auth/login", (req, res) => {
    const { email, password } = req.body;
  
    if (isAuthenticated({ email, password })) {
      const user = getUsersDb().users.find(
        (user) => user.email === email && user.password === password
      );
      const { id, nickname, type } = user;
  
      const jwToken = createToken({ id, nickname, type, email });
      return res.status(200).json(jwToken);
    } else {
      const status = 401;
      const message = "Incorrect email or password";
      return res.status(status).json({ status, message });
    }
  
    return res.status(200).json("Login Success");
  });


//Register New User
server.post('/auth/register', (req, res) => {
    //获取注册填写信息
    const { email, password, type} = req.body;

    //1 step -- 检查是否已注册
    if(isAuthenticated({email, password})){
        const status = 401;
        const message = 'Email and Password already exist';
        return res.status(status).json({ status, message});
    }

    //2 step -- 写入
    fs.readFile(path.join(__dirname, 'user.json'), (err, _data) => {
        if(err){
            const status = 401;
            const message = err;
            return res.status(status).json({status, message});
        }
        //get current users data
        const data = JSON.parse(_data.toString());
        //get the id of last user
        const last_item_id = data.users[data.users.length -1].id;
        //add new user
        data.users.push({id: last_item_id +1, email, password, type}); //add some data
        fs.writeFile(
            path.join(__dirname, 'users.json'),
            JSON.stringify(data),
            (err, result) => {
                //write
                if(err) {
                    const status = 401;
                    const message = err;
                    res.status(status).json({ status, message});
                    return;
                }
            }
        );
    });

    //create token for new user
    const jwToken = createToken({id, type, email});
    res.status(200).json(jwToken);

});

server.use(router);
server.listen(3006, () => {
  console.log('JSON Server is running');
});