import mongoose from 'mongoose';

async function run() {
  const uri = 'mongodb://127.0.0.1:27017/sathi';
  console.log('connecting...');
  const conn = await mongoose.connect(uri);
  console.log('connected, readyState=', conn.connection.readyState);

  const User = mongoose.model('User', new mongoose.Schema({ name: String }));
  const a = await User.findOne();
  console.log('query 1 ok', a);
  const b = await User.findOne();
  console.log('query 2 ok', b);
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('FAILED', e);
    process.exit(1);
  });
