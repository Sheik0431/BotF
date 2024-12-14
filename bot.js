const { Telegraf, Markup } = require("telegraf");
const mongoose = require("mongoose");

// Telegram Bot Token
const TOKEN = "7712916176:AAF15UqOplv1hTdJVxILWoUOEefEKjGJOso";
const bot = new Telegraf(TOKEN);

// MongoDB Connection URLs
const DATABASE_URL = "mongodb+srv://abi:abi@cluster0.dzzos.mongodb.net/Residency?retryWrites=true&w=majority&appName=Cluster0";
const DATABASE_URL_FILTER = "mongodb+srv://abisheikabisheik102:abi@realestate.obn2d.mongodb.net/estate?retryWrites=true&w=majority&appName=RealEstate";

// Connect to MongoDB
mongoose.connect(DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to Residency Database"))
  .catch((error) => console.error("Error connecting to MongoDB:", error.message));

mongoose.connect(DATABASE_URL_FILTER, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to Estate Database"))
  .catch((error) => console.error("Error connecting to MongoDB:", error.message));

// Define districts
const DISTRICTS = [
  "Vera", "Mtatsminda", "Vake", "Sololaki", "Chugureti", "Saburtalo",
  "Didube", "Gldani", "Avlabari", "Isani", "Samgori", "Dighomi",
  "Varketili", "Ortachala", "Abanotubani", "Didi Dighomi",
  "Dighomi Massive", "Lisi Lake", "Vashlijvari", "Afrika",
  "Vasizubani", "Kukia", "Elia", "Okrokana", "Avchala",
  "Temqa", "Tskhneti", "Bagebi", "Nutsubidze Plato",
  "Vake-Saburtalo", "Vezisi", "Tkhinvali", "Kus Tba (Turtle Lake)",
  "Lisi", "Mukhatgverdi", "Mukhattskaro", "Nutsubidze Plateau",
  "Lisi Adjacent Area", "Digomi 1-9", "Sof. Digomi (Village Digomi)",
  "Dighmis Chala", "Koshigora", "Didgori", "Old Tblisi",
  "Krtsanisi", "Tsavkisi Valley", "Didube-Chughureti",
  "Dighmis Massive (Dighmis Masivi)", "Iveri Settlement (Ivertubani)",
  "Svaneti Quarter (Svanetis Ubani)", "Gldani-Nadzaladevi"
];

// Define the Property Schema
const propertySchema = new mongoose.Schema({
  title: String,
  address: String,
  price: Number,
  city: String,
  bathrooms: Number,
  rooms: Number,
  area: Number,
  type: String,
  images: [String],
  residencyType: String,
  description: String,
  status: String,
  propertyType: String,
  district: [String],
  parking: Boolean,
});
console.log(propertySchema)

const Property = mongoose.model("Residency", propertySchema);
console.log(Property, "yugygggygyugfftyftdtdt")

// Helper Function: Fetch Properties by Filters
const fetchPropertiesByFilters = async (filters) => {
  try {
    const query = {};
    
    // Helper function to capitalize each word
    const capitalizeWords = (str) => {
      return str.replace(/\b\w/g, (char) => char.toUpperCase());
    };
    
    // Apply price range filter
    if (filters.minPrice && filters.maxPrice) {
      query.price = { $gte: filters.minPrice, $lte: filters.maxPrice };
    }

    // Capitalize and filter by city
    if (filters.city) {
      query.city = capitalizeWords(filters.city);
    }

    // Capitalize and filter by district
    if (filters.district) {
      query.district = capitalizeWords(filters.district);
    }
    console.log(filters)
    console.log(query)

    // Fetch properties based on query
    const properties = await Property.find({
      price: { $gte: filters.minPrice, $lte: filters.maxPrice }, // Filter properties where price is between minPrice and maxPrice
      district: { $in: [query.district] }, // Example: Filter by district
      city: query.city // Example: Filter by city
    })

    console.log(properties);
    console.log("Found properties:", properties.length);

    return properties;
  } catch (error) {
    console.error("Error fetching properties by filters:", error.message);
    return [];
  }
};

// Helper Function: Format Property Data
const formatProperty = (property) => {
  return (`
    🏠 *${property.title || "Untitled"}*\n 
    📍 Location: ${property.address || "Not provided"}\n 
    🏙 City: ${property.city || "Not provided"}\n
    🏙 District: ${property.district || "Not provided"}\n 
    💰 Price: $${property.price || "N/A"}\n 
    🛏 Rooms: ${property.rooms || "N/A"}\n 
    🛁 Bathrooms: ${property.bathrooms || "N/A"}\n 
    📏 Area: ${property.area || "N/A"} sqft\n 
    🚗 Parking: ${property.parking ? "Yes" : "No"}\n 
       `
  );
};

// Helper Function: Send Filtered Properties
const sendFilteredProperties = async (ctx, properties) => {
  if (properties.length === 0) {
    await ctx.reply("No properties found matching your criteria.");
    return;
  }

  for (let property of properties) {
    if (property.images && property.images.length > 0) {
      await ctx.replyWithPhoto(
        { url: property.images[0] },
        {
          caption: formatProperty(property),
          parse_mode: "Markdown",
          reply_markup: Markup.inlineKeyboard([
            Markup.button.url(
              "View Details",
              `https://real-estate-frag.vercel.app/properties/${property._id}`
            ),
          ]),
        }
      );
    } else {
      await ctx.replyWithMarkdown(
        formatProperty(property),
        Markup.inlineKeyboard([
          Markup.button.url(
            "View Details",
            `https://real-estate-frag.vercel.app/properties/${property._id}`
          ),
        ])
      );
    }
  }
};

// Start Command
bot.start((ctx) => {
  const welcomeMessage = `
  🏠 GEOMAP — a full-featured application available directly within Telegram, with maps and filters.

  No registration or email is required to interact with the app or contact the author of a listing. Simply click "Open Application," specify your search parameters, and choose a suitable option on the map or in the list.
  `;

  return ctx.replyWithMarkdown(welcomeMessage, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Open",
            web_app: { url: "https://your-web-app-url.com" }, // Replace with your web app URL
          },
        ],
        [
          { text: "👉 Open GeoMap", url: "https://t.me/rent_tblisi_ge/9859" },
        ],
        [
          { text: "📝 Post an Ad", web_app: { url: "https://add-bot.vercel.app" } },
        ],
        [
          { text: "🏠 All Properties", callback_data: "all_properties" },
        ],
        [
          { text: "✨ Find Your Dream Property", callback_data: "find_dream_property" },
        ],
      ],
    },
  });
});

// Handle All Properties Command
bot.action("all_properties", async (ctx) => {
  await ctx.answerCbQuery();
  try {
    const properties = await Property.find();
    console.log("Found properties:", properties.length);
    await sendFilteredProperties(ctx, properties);
  } catch (error) {
    console.error("Error all properties:", error.message);
    await ctx.reply("An error occurred while fetching properties. Please try again later.");
  }
});

// Handle Find Dream Property Command
bot.action("find_dream_property", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(
    "Hello! 😊 GeoMap is your trusted real estate partner, helping you find dream homes and properties in Georgia with ease. 🏡✨"
  );
  setTimeout(async () => {
    await ctx.reply("Choose your next step:", {
      reply_markup: {
        inline_keyboard: [[{ text: "Choose Property 🏠", callback_data: "choose_property" }]],
      },
    });
  }, 3000);
});
const datas = {}

// Handle Choose Property Command
bot.action("choose_property", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("Select a city:", {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Tblisi", callback_data: "city_tblisi" },
          { text: "Batumi", callback_data: "city_batumi" },
        ],
        [{ text: "⬅ Back", callback_data: "find_dream_property" }], // Back button

      ],
    },
  });
});

// Handle City Selection
bot.action(/city_(.+)/, async (ctx) => {
  const city = ctx.match[1];
  ctx.session = ctx.session || {}; // Ensure session exists
  ctx.session.city = city;
  datas.city = city;
  await ctx.reply(`City selected: ${city}. Select a district:`, {
    reply_markup: {
      inline_keyboard: [
        ...DISTRICTS.map((district) => [
          {
            text: district,
            callback_data: `district_${district.toLowerCase().replace(/[^a-z0-9]/g, '_')},`
          },
        ]),
        [{ text: "⬅ Back", callback_data: "choose_property" }], // Back button
      ],
    },
  });
});

// Handle District Selection
bot.action(/district_(.+)/, async (ctx) => {
  const district = ctx.match[1];
  ctx.session = ctx.session || {}; // Ensure session exists
  ctx.session.district = district;
  datas.district = district.slice(0 , district.length-1);
  await ctx.reply("Select a price range:", {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "$100 - $200", callback_data: "price_100_200" },
          { text: "$200 - $300", callback_data: "price_200_300" },
        ],
        [
          { text: "$300 - $500", callback_data: "price_300_500" },
          { text: "$500 - $1000", callback_data: "price_500_1000" },
        ],
        [{ text: "Above $1000", callback_data: "price_above_1000" }],
        [{ text: "⬅ Back", callback_data: `city_${ctx.session.city}` }], // Back button
      ],
    },
  });
});

// Handle Price Selection
bot.action(/price_(.+)/, async (ctx) => {
  const priceRange = ctx.match[1];
  const [minPrice, maxPrice] =
    priceRange === "above_1000" ? [1000, null] : priceRange.split("_").map(Number);

  ctx.session = ctx.session || {}; // Ensure session exists
  ctx.session.minPrice = minPrice;
  ctx.session.maxPrice = maxPrice;
  datas.minPrice = minPrice;
  datas.maxPrice = maxPrice;

  const filters = {
    city: ctx.session.city,
    district: ctx.session.district,
    minPrice,
    maxPrice,
  };

  try {
    console.log(datas)
    const properties = await fetchPropertiesByFilters(datas);
    await sendFilteredProperties(ctx, properties);
  } catch (error) {
    console.error("Error fetching filtered properties:", error.message);
    await ctx.reply("An error occurred while fetching properties. Please try again later.");
  }
});

// Launch the bot
bot.launch().then(() => console.log("Telegram Bot is running"));

// Graceful Shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));