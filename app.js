
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , passport = require('passport')
  , socketio = require('socket.io')
  , mongoose = require('mongoose')
  , redis = require('redis')
  , KakaoStrategy = require('passport-kakao').Strategy
  , FacebookStrategy = require('passport-facebook').Strategy;


var FACEBOOK_APP_ID = "756387701134101"
var FACEBOOK_APP_SECRET = "69ed2406f09b464616a2ceac14981fcf";

//passport 에 Kakao Oauth 추가
passport.use( new KakaoStrategy({
        clientID: 'acd16274636c8807be1f6e2aa436ae52',
        callbackURL: "http://52.69.102.82:3000/oauth"
    },
    function(accessToken, refreshToken, params, profile, done){
        // authorization 에 성공했을때의 액션

        save(accessToken, refreshToken, profile);
        return done(null, profile._json);
    })
);

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://52.69.102.82:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Facebook profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Facebook account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));


passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'files')));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}






app.get('/', routes.index);
app.get('/users', user.list);

// kakao login request
app.get("/login", passport.authenticate('kakao',{state: "myStateValue"}));
// kakao login result
app.get("/oauth", passport.authenticate('kakao'), function(req, res){
    // 로그인 시작시 state 값을 받을 수 있음
    //res.send("state :" + req.query.state);
    // backURL=req.header('Referer') || '/';
  // do your thang
  // res.redirect(backURL);
  //res.send("login success");
	res.redirect("kakao-logout.html");
});

// facebook login request
app.get('/auth/facebook', passport.authenticate('facebook'), function(req, res){
	// The request will be redirected to Facebook for authentication, so this
	// function will not be called.
});
// facebook login result
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/auth/facebook' }), function(req, res) {
	res.redirect("kakao-logout.html");
});
//app.get('/auth/facebook/callback', passport.authenticate('facebook', {successRedirect: '/login_success', failureRedirect: '/login_fail' }));
//// facebook login success
//app.get('/login_success', ensureAuthenticated, function(req, res){
//	console.log("facebook login sucess");
//    res.send(req.user);
//});
// facebook logout
app.get('/auth/facebook/logout', function(req, res){
	req.logout();
	res.redirect("kakao-logout.html");
});




// apk download
app.get('/apk', function(req, res){
	var file = __dirname + '/files/MyPol_0.1.0.apk';
	res.download(file); // Set disposition and send it.
});


// 사용자 구현 부분
function save(accessToken, refreshToken, profile){
    //save 로직 구현

    console.log( "accessToken :" + accessToken );
    console.log( "사용자 profile: " + JSON.stringify(profile._json) );
}

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { 
		console.log("now login"); 
//		return next(); 
	} else {
		console.log("now logout");
	}
	
//	res.redirect("kakao-logout.html");
}




//var server = http.createServer(app);
//var io = socketio.listen(server);
//var users = [];
//var subscriber = redis.createClient();
//var publisher = redis.createClient();
////=======================================================
//mongoose.connect('mongodb://127.0.0.1/test');
//var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;
//var chatLogs = new Schema({
//	id:ObjectId,log:String,date:String,userid:String
//});
//var ChatLogModel = mongoose.model('chatlog',chatLogs);
//var chatMsgs = new Schema({
//	id:ObjectId,message:String
//});
//var ChatMsgModel = mongoose.model('chatmsg',chatMsgs);
//function saveLog(socket,id,state) {
//	var chatLog = new ChatLogModel();
//	if (state == 'conn') 	chatLog.log = id+'님이 접속했습니다.';
//	else 					chatLog.log = id+'님이 나갔습니다.';
//	chatLog.date = new Date();
//	chatLog.userid = id;
//	chatLog.save(function(err) {
//		if (err) console.log(err);
//		else {
//			ChatLogModel.find({},function(err,logs){
//				socket.emit('logs',JSON.stringify(logs));
//				socket.broadcast.emit('logs',JSON.stringify(logs));
//			});
//		}
//	});
//}
////=======================================================
//io.sockets.on('connection',function(socket){
//	console.log('connection');
//	//-------------------------------------------------------------------
//	subscriber.subscribe('chat');
//	subscriber.on('message',function(channel,message){
//		socket.emit('message_go',
//				JSON.stringify({message:message}));
//	});
//	socket.on('message',function(raw_msg){
//		console.log('message:'+raw_msg);
//		var msg = JSON.parse(raw_msg);
//		var chat_msg = msg.chat_id+':'+msg.message;
//		publisher.publish('chat',chat_msg);
//		var chatmsg = new ChatMsgModel();
//		chatmsg.message = chat_msg;
//		chatmsg.save(function(err) { if(err)console.log(err); });
//	});
//	//-------------------------------------------------------------------
//	socket.on('chat_conn',function(raw_msg){
//		console.log('chat_conn:'+raw_msg);
//		var msg = JSON.parse(raw_msg);
//		var index = users.indexOf(msg.chat_id);
//		if (index == -1) {
//			users.push(msg.chat_id);
//			socket.emit('chat_join',JSON.stringify(users));
//			socket.broadcast.emit('chat_join',JSON.stringify(users));
//			saveLog(socket,msg.chat_id,'conn');
//			ChatMsgModel.find({},function(err,results){
//				socket.emit('message_go',JSON.stringify(results));
//			});
//		} else {
//			socket.emit('chat_fail',JSON.stringify(msg.chat_id));
//		}
//	});
//	socket.on('leave',function(raw_msg){
//		console.log('leave:'+raw_msg);
//		var msg = JSON.parse(raw_msg);
//		if (msg.chat_id != '' && msg.chat_id != undefined) {
//			var index = users.indexOf(msg.chat_id);
//			users.splice(index,1);
//			socket.emit('someone_leaved',JSON.stringify(users));
//			socket.broadcast.emit('someone_leaved',JSON.stringify(users));
//			saveLog(socket,msg.chat_id,'leave');
//		}
//	});
//	//클라이언트의 브라우저가 종료되도 연결종료 처리가능 
//	/*socket.on('disconnect',function(raw_msg){
//		console.log('disconnect');
//		subscriber.unsubscribe();
//		subscriber.quit();
//		publisher.quit();
//	});*/
//});
//io.sockets.on('close',function(socket){
//	console.log('close');
//	subscriber.unsubscribe();
//	subscriber.close();
//	publisher.close();
//});




http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
