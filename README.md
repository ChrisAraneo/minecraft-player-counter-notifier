# Minecraft Players Number Notifier (v0.5.0)

![Minecraft Players Number Notifier logo](logo.png?raw=true)

## What is it?

The purpose of this script is to notify server admin about the number of players on the server. Current version supports sending direct messages via Discord. The script was created as a solution to the author's personal needs.

## Configuration file

Before running the application fill the values in the `src/config.json` configuration file (this file will be copied into `dist/config.json`` on script start).

### Example `config.json`

```json
{
    "servers": ["abc.com", "minikraft.example"],
    "interval": 60000,
    "discord": true,
    "log-level": "debug",
    "cache-ttl": 30000,
    "recipients": [],
}
```

### Configuration parameters explained

- **`servers` - list of servers you want to track**
- **`interval` - time between next updates of the number of players (in milliseconds); sixty seconds is usually low enough**
- **`discord` - `true` means the discord bot will notify you; `false` if you want to disable it** (if you are using discord bot then remember to provide DISCORD_TOKEN environment variable, more info below)
- `log-level` - severity of logs do you want to see (you can leave it on debug)
- `cache-ttl` - time after which the cache expires (should be lower than `interval`)
- `recipients` - predefined discord recipients (IDs of users); if you want the bot to know recipients of notify messages you can fill this list

Note: the most important parameters are bold

## Discord token

If you want notifications to be sent via Discord, **you must provide the `DISCORD_TOKEN` environment variable** and also set the `discord` value in configuration file to be `true`.

You can get Discord token when you create a Discord bot first (see the next chapter).

## How to use Discord bot?

1. Create a bot instance on [https://discord.com/developers/applications].
2. Invite bot to your Discord server.
3. `@mention` bot on server chat - after successful mention bot should send you a hello message and he will notify you from this moment.

## Running script from the command line

```bash
npm install
```

```bash
# Linux example how to set environment variable before script run
DISCORD_TOKEN=YOURTOKENHERE npm run start
```

## Running script with Docker

```bash
# Build image
docker build --build-arg DISCORD_TOKEN="YOURTOKENHERE" -t mpnn .
```

```bash
# Create and run container
docker run mpnn
```

Warning: current version of Dockerfile will store your Discord token in image. Be careful and don't leak your token.

# License

Project is [MIT licensed](LICENSE).
Project logo is [CC0 1.0 Deed licensed](https://creativecommons.org/publicdomain/zero/1.0/deed.en). Logo contains [modified image made by JohannPoufPouf](https://openverse.org/image/93f54523-5ce1-469a-9cf6-531f0ca8b6ea).
