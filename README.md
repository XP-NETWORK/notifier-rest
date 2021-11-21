# notifier-rest


## Generate the hash for your secret

make sure to keep this hash as you will need it for algorand backend

`yarn hash`

## Update .env

```
# Can be Anything
PORT=8080
# Hash obtained from previous command
EVENT_SECRET_HASH=
```

# Start the server

`yarn dev`