const readline = require('readline');
const crypto = require('crypto');

async function hash(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) {
        reject(err);
      }
      resolve(salt + ':' + derivedKey.toString('hex'));
    });
  });
}

async function main() {
  const read = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const secret = await new Promise((res) =>
    read.question('enter secret to hash: ', res)
  );
  console.log('hash is', await hash(secret));
}

main().then(() => process.exit(0));
