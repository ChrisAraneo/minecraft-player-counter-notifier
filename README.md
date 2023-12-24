# Minecraft Players Number Notifier (v0.0.1)

![Minecraft Players Number Notifier logo](logo.png?raw=true)

# Environment variables & config

If you want notifications to be sent via Discord, you must provide the DISCORD_TOKEN environment variable when starting the script.

Example:

`config.json`
```json
{
    "cache-ttl": 30000,
    "discord": true,
    "interval": 60000,
    "servers": ["wulfixowo.maxcraft.pl"]
}
```

```bash
npm run start DISCORD_TOKEN=YOURTOKENHERE
```

# License

Project is [MIT licensed](LICENSE).
Project logo is [CC0 1.0 Deed licensed](https://creativecommons.org/publicdomain/zero/1.0/deed.en). Logo contains [modified image made by JohannPoufPouf](https://openverse.org/image/93f54523-5ce1-469a-9cf6-531f0ca8b6ea).