# Apollo-Curius 💎

Apollo-curius is a search engine based off [Apollo](https://github.com/amirgamil/apollo) that indexes all of my [Curius data](https://curius.app/amir-gamil).

If you use [Curius](https://curius.app/), you can get a version of this running with your data very easily. If you don't use Curius, start using it.

## Running with your Curius

1. Run `cp .env.example .env` to setup your .env file. In your `.env` file, put the value of your Curius ID. You can do this by opening up `Inspect Element` in Chrome, then navigate to your curius bookshelf i.e. `https://curius.app/<your username>`. In the network tab, you should see a request made that has the URL `https://curius.app/api/user`. Open up the response and you should see your ID there.
2. Run `go run cmd/apollo-curius.go`
3. You should be set! Wait maybe a minute or two for the program to fetch all your Curius data and set up the inverted index, when you see a `Server listening on 0.0.0.0:8990`, you can navigate to `http://localhost:8900` and it should be working!

Note if you want to deploy it, this might be a little more involved, but I can help if you DM me on [Twitter](https://twitter.com/amirbolous). I have a Digital Ocean Droplet and I deployed this app as a `systemctl` service behind an `nginx` reverse-proxy. If none of that makes sense, DM me and I'll explain.
