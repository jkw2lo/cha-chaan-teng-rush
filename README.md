# Cha Chaan Teng Rush

**Play:** https://jkw2lo.github.io/cha-chaan-teng-rush/ (pick a region, then a restaurant)

- Cha Chaan Teng Rush: https://jkw2lo.github.io/cha-chaan-teng-rush/cct/
- Dim Sum Rush: https://jkw2lo.github.io/cha-chaan-teng-rush/dimsum/

Old `?game=dimsum` links redirect to the new addresses.

A cooking and restaurant-management game set in a Hong Kong cha chaan teng (茶餐廳). You run the kitchen during a 12-minute day, keep the stock up, and spend the takings on furniture, a bigger dining room and faster appliances between days.

Plain HTML, CSS and JS modules. No build step and no dependencies. It runs in any modern browser and is served as a static site. GitHub Pages serves `main` directly, so pushing is deploying.

## Two restaurants, one engine

The game engine is shared; each restaurant is a theme in `themes/`:

- **Cha Chaan Teng Rush** (`themes/cct`, at `/cct/`): milk tea, pineapple buns, noodles and toast.
- **Dim Sum Rush** (`themes/dimsum`, at `/dimsum/`): a Sunday-morning 酒樓. Finished baskets ride on a trolley that holds 8, waiters push the trolley to the tables, and a full trolley sheds its oldest unwanted basket (counted as waste) instead of jamming the kitchen.

Each keeps its own save. The landing page (`index.html`) shows where each save is up to.

**Pages:** `game.html` is the one game page. `node tools/pages.mjs` writes `cct/index.html` and `dimsum/index.html` from it (each just names its restaurant), so edit `game.html` and rerun the script rather than editing the copies. The script also stamps a version on the stylesheet and script links so browsers pick up new pushes straight away.

## Learning mode

Off by default; switch it on from the title card or the **學** button. Tickets show dish names in Cantonese with Jyutping, which fades as you learn each dish. Customers say their whole order in a bubble (「唔該，兩籠蝦餃！」) and aloud when the device has a Cantonese voice. After 6 servings a dish is *known*: its picture drops off the ticket, and tickets you fill by reading alone tip 15% more. The **學** button also opens your word list.

## Running it locally

ES modules don't load from `file://`, so serve the folder. Needs Node 18 or later.

    node tools/server.mjs          # open http://localhost:8741 (the landing page); moves to the next free port if that one's taken
    node tools/pages.mjs           # after editing game.html: rewrite cct/index.html and dimsum/index.html
    node tools/simulate.mjs 30 casual              # 30 days with a human-paced bot (or 'perfect'), one line per day
    GAME=dimsum node tools/simulate.mjs 30 casual  # the same for Dim Sum Rush

## Controls

- **Click a station** to give the cook a job; keep clicking to line up more; right-click clears that station's jobs. Click a job in the cook's queue (it shows ×) to take just that one off; if the cook had started it, the ingredients go back on the shelf.
- **Mouse wheel / trackpad** zooms toward the pointer; drag empty floor to pan. **K** jumps to the kitchen, **0** shows the whole shop, **+ / −** zoom.
- **Space** pauses. The speed button cycles 1× / 2× / 3×.
- While editing: drag to buy or move, **R** rotates, **Esc** cancels or deselects.
- **Drag the left panel's right edge** to make it wider or narrower (double-click the edge to reset; arrow keys work when it's focused). The width is remembered.
- **? Tour** (top left, before opening) replays the walkthrough. **♪** cycles sound: effects and Cantonese call-outs, effects only, or off.

Add `?debug` to the URL for `window.cct` in the console: `cct.S` (save), `cct.R` (today), `cct.money(500)`, `cct.stars(3)`, `cct.ff(60)` (fast-forward 60 game seconds).

## How a day works

- **Tickets.** Customers walk in, sit in a free working seat and order 1–4 items. The ticket appears on the rail and above their head, with a patience timer.
- **The cook.** Each click on a station adds a job to the cook's queue (numbered badges on the station, 5 jobs at most). Once the queue is full, one more click on a station clears all of that station's waiting jobs; right-click clears them straight away. The cook walks to each station in turn and stays there until it's done.
- **The pass.** Finished items wait on the pass, which holds 5. If it's full, the cook waits at the station until there's room. Tickets are filled in the order they came in: an earlier ticket claims what it needs from the pass even before it's complete, so a later, smaller ticket can't take its items. A waiter takes a ticket out as soon as it's complete. Items that sit too long (ice melts first) are thrown away, and their ingredient cost comes out of your cash.
- **Throwing out.** Click a dish on the pass to bin it and free the spot. It counts as waste, like anything that goes stale.
- **Boosters** (加油), for busy spells, one of each at a time: *coffee for the cook* ($40) cuts each dish’s cooking time by 35% for 60 seconds (walking between stations isn’t sped up); a *free drinks round* ($60) makes waiting customers twice as patient for 60 seconds. Dim sum has its own versions (strong tea, free snacks).
- **Money and popularity.** Faster tickets earn bigger tips and more popularity. A walkout costs 4 popularity. Popularity sets how often customers turn up.
- **Stock.** Every item uses ingredients. What's already in the queue is reserved. Each ingredient holds 2 packs, plus 1 more pack per stock shelf in the kitchen; you can't order past that. Deliveries during the day take 30–60 seconds; the inventory row shows the countdown, then turns green for a moment when it arrives. Orders placed between days arrive before opening. If everything on the menu is sold out and nothing is on the way, the shop has to close early.
- **Targets.** Each day has a sales target (sales plus tips) and two goals picked for that day, such as serving a number of tickets or wasting nothing. The sales target pays $100 and +3 popularity; each goal pays $60. The day summary scores you out of three stars.
- **Unlocks.** Iced milk tea and 菠蘿油 aren't on the menu until you've bought ice and butter for the first time.
- **Levels.** The stars from daily targets add up to a restaurant level, from 1 to 10 (3, 7, 12, 17, 23, 29, 36, 43 and 50 stars). Each level opens a new dish: its station appears in the kitchen shop and its ingredients in the inventory. A dish goes on the menu once you own its station and have its ingredients. The sales target follows your level, not the day.

  | Level | Dish | Station | New ingredients |
  |---|---|---|---|
  | 2 | 奶油多 condensed milk toast | toaster | bread, condensed milk |
  | 3 | 西多士 French toast | French toast pan | eggs, golden syrup |
  | 4 | 餐蛋麵 luncheon meat & egg noodles | noodle pot | instant noodles, luncheon meat |
  | 5 | 凍檸茶 iced lemon tea | lemon tea bar | lemons |
  | 6 | 鴛鴦 yuenyeung | coffee urn | coffee |
  | 7 | 沙嗲牛麵 satay beef noodles | satay pot | beef, satay & soy |
  | 8 | 豬扒包 pork chop bun | pork chop griddle | pork chops |
  | 9 | 蛋撻 egg tart | tart oven | tart pastry |
  | 10 | 乾炒牛河 beef chow fun | wok station | rice noodles |

  Levels 5 and 8 also let you knock the kitchen through (8 → 10 → 12 columns), and levels 6, 8 and 10 open premium decor in each style. At level 10 you can switch on **relaxed days**: customers wait much longer and walkouts don't cost popularity, for building out the shop at your own pace.
- **Sound.** Everything is synthesised in the browser (no audio files). New orders are called out in Cantonese if the device has a Cantonese voice installed.

## Between days

**Replay.** The end-of-day summary has a *Replay day N* button, and the *Close early* dialog has *Restart the day*. Both put everything (cash, stock, popularity, layout, stars) back to how it was when you opened the shutters that morning.

Rearranging only happens between days: before you open, or from the end-of-day summary. Editing is drag and drop: drag a card from the catalogue into the room to buy it, drag anything already in the room to move it, and click something for a floating Rotate / Sell bar (R also rotates, Esc deselects).

- **Kitchen** (廚房): move, rotate, buy and sell appliances. Each appliance is used from the tile it faces, marked by a rubber floor mat with a yellow edge (and an arrow while editing), and the layout must keep every station reachable. The "Pro" versions cook about 35–40% faster.
- **Dining room** (裝修): furniture in three styles (老派 old school, 簡約 simple, 新派 modern), floors, wall pieces, ceiling fans and lamps. A seat only works if it faces a table and can be reached from the door; the seat count is the maximum number of customers at once. You can buy two expansions.
- **Ambience** (氣氛): every piece of decor has appeal points, and pieces of the same style multiply each other (×1.08 per extra piece, up to ×2), so a matching set beats a jumble. It's scored out of 200: the bonus grows steadily up to +50% customers and +40% tips at 200, and anything past that is bragging rights. The catalogue shows what each piece would add right now.


## Code map

| file | what's in it |
|---|---|
| `js/data.js` | engine tuning, plus the active theme's content once `useTheme()` has run |
| `js/state.js` | the saved game (money, stock, layout) and localStorage |
| `js/world.js` | grid layout, pathfinding, layout validation, seat checks |
| `js/sim.js` | one day: customers, tickets, cook queue, pass, waiters, deliveries, popularity, storage, learning |
| `js/ambience.js` | decor appeal, same-style set multipliers, and what ambience does |
| `js/iso.js` | isometric projection and drawing primitives (lit boxes, cylinders, materials) |
| `js/art.js` | shared drawing: people, walls, light, doors, windows, the trolley, helpers for themes |
| `js/render.js` | draws a frame in depth order and returns click targets |
| `js/edit.js` | buying, placing, moving, rotating, selling |
| `js/ui.js` | the HTML panels: status, tickets, inventory, restock, catalogue, summary, word list |
| `js/main.js` | loads the theme, then the loop, input, camera and day flow |
| `js/splash.js` | the opening street scene (signs and title come from the theme) |
| `js/tutorial.js` | the walkthrough for new games |
| `js/sound.js` | synthesised sound effects and spoken orders in the theme's language |
| `themes/<id>/index.js` | the theme's name, sign, palette, language, splash, and how customers phrase orders |
| `themes/<id>/data.js` | its ingredients, menu (with romanisation and measure words), appliances, decor, goals and starting layout |
| `themes/<id>/art.js` | its dish icons, stations, furniture, lamps, wall pieces and floors |
| `tools/server.mjs` | a tiny static dev server |
| `tools/simulate.mjs` | headless bot that plays whole days, for balancing (`GAME=` picks the theme) |

## Adding a restaurant

Copy `themes/dimsum` to `themes/<id>`, change its `index.js`, `data.js` and `art.js` (anything you don't draw can fall through to another theme's art), add the id to `GAMES` in `js/main.js`, `js/ui.js` and `tools/pages.mjs`, run `node tools/pages.mjs`, and add a card to `index.html`.

Besides `icon`, `floor`, `station`, `decor`, `ceiling` and `wallItem`, a theme's `art.js` can optionally export these to restyle the shared room (Dim Sum uses all of them; the cha chaan teng uses `wallFace`, `windowFrame`, `sign`, `room`, `partition` and `serve`):

- `wallSegment(iso, pts, kitchen)`: draw one wall strip; return `true` to replace the default.
- `wallFace(face, x, y, iso)`: panelling on each dining-wall cell.
- `windowFrame(c)`, `sign(c)`, `room(iso, dw, door)`, `partition(iso, x)`, `kitchenWall(iso)`: window lattice, shop sign, extra room pieces (pillars), the kitchen half wall, and what hangs on the kitchen wall.
- `trolley(iso, x, y, face, t)`: the cart a waiter pushes (with `meta.trolley`).
- `serve(iso, items, tx, ty, dx, dy, progress)`: how a served order sits on the table.

`meta.uniform` dresses the staff (`{ waiter: { shirt, vest, trim, bow } }`), and `meta.palette` can set `cap` (the wall-top colour) alongside the other wall and floor colours.

## Adding a menu item

1. Add any new ingredient to `INGREDIENTS` in the theme's `data.js`.
2. Add the item to `MENU` and `MENU_ORDER`, with a `level` if it should open up later.
3. Add an appliance with `makes: '<item>'` to `APPLIANCES` (and `APPLIANCE_SHOP` if it can be bought).
4. Draw it: a case in `station()` and an icon in `icon()` in the theme's `art.js`. For learning mode, give the dish `jp` (romanisation) and `m` (measure word).

## Saving

Progress is saved to localStorage at the start of each day and after anything you do before opening. A reload in the middle of a day restarts that day from its opening.
