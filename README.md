# New Articles Bot
This is a Node.js program used by the SCP-VN Wiki to automatically send notifications about new articles on a specific Wikidot wiki to a Discord webhook.

## Installation
This program is made specifically for SCP-VN Wiki, so installation is not supported. However, if you want to install and use this program anyways, here are the instructions:

1. Make sure you have a Wikidot account that you can use for this program. It is recommended to create a Wikidot account separate from your current account, for use with this program. Only account creation is necessary; there is no need for the account to join the wiki that you're tracking for new articles, nor any need to grant it special rights. 
    
    Supplying Wikidot credentials to the program is for bypassing Wikidot's static cache, which prevents timely updates.
2. Clone this repository.
3. Rename the `config.json.example` file to `config.json`, and fill in required information (self-explanatory).
4. Install necessary npm packages by running `npm install`.
5. This program is specifically made for SCP-VN Wiki, so there are many project-specific aspects (such as Vietnamese strings and others). Modify these as you see fit.
6. Run the program using `node .` and leave it on, preferably by hosting it on a server (such as a VPS).

## Limitations
This program's current design only allows it to process one article at a time. Therefore, the polling interval used is very short (only 5 seconds, which is also related to the author's original intention to make updates as close to real-time as possible). If the polling interval is too long (for instance, 1 hour), and during that time there is more than one new article, the program may miss the other articles and only send a notification on the latest article. Rewriting the program to allow for more than one new article within the polling interval is currently not a planned feature.

## License
This program is licensed under the MIT license.