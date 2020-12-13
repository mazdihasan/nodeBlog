// Custom Middle ware
exports.isAdmin = (req, res, next) => {
   user = req.user;
  if(!user) {
    req.flash('error', 'Please Log into view this resource');
    return res.redirect('/users/login')
  }
  if(user){
    req.user = user;
    next();
  }
 
 }
 
 exports.notAdmin = (req, res, next) => {
  user = req.user;
 if(!user) {
  next();
 }
 if(user){
  return res.redirect('/dashboard');
  next();
 }
} 