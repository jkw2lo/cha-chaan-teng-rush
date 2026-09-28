# Cha Chaan Teng Rush

A cooking and restaurant-management game set in a Hong Kong cha chaan teng (茶餐廳). You run the kitchen during a 12-minute day, keep the stock up, and spend the takings on furniture, a bigger dining room and faster appliances between days.

Plain HTML, CSS and JS modules. No build step and no dependencies. It runs in any modern browser and can be served as a static site (GitHub Pages works as is: serve the repo root).

## Running it locally

ES modules don't load from `file://`, so serve the folder. Needs Node 18 or later.

    node tools/server.mjs          # open http://localhost:8741 (moves to the next free port if that one's taken)
    node tools/simulate.mjs 3      # play 3 days headlessly with a bot cook, prints a line per day

## Controls

- **Click a station** to give the cook a job; keep clicking to line up more; right-click clears that station's jobs.
- **Mouse wheel / trackpad** zooms toward the pointer; drag empty floor to pan. **K** jumps to the kitchen, **0** shows the whole shop, **+ / −** zoom.
- **Space** pauses. The speed button cycles 1× / 2× / 3×.
- While editing: drag to buy or move, **R** rotates, **Esc** cancels or deselects.
- **? Tour** (top left, before opening) replays the walkthrough.

Add `?debug` to the URL for `window.cct` in the console: `cct.S` (save), `cct.R` (today), `cct.money(500)`, `cct.stars(3)`, `cct.ff(60)` (fast-forward 60 game seconds).

## How a day works

- **Tickets.** Customers walk in, sit in a free working seat and order 1–4 items. The ticket appears on the rail and above their head, with a patience timer.
- **The cook.** Each click on a station adds a job to the cook's queue (numbered badges on the station, 5 jobs at most). Once the queue is full, one more click on a station clears all of that station's waiting jobs; right-click clears them straight away. The cook walks to each station in turn and stays there until it's done.
- **The pass.** Finished items wait on the pass, which holds 5. If it's full, the cook waits at the station until there's room. Tickets are filled in the order they came in: an earlier ticket claims what it needs from the pass even before it's complete, so a later, smaller ticket can't take its items. A waiter takes a ticket out as soon as it's complete. Items that sit too long (ice melts first) are thrown away, and their ingredient cost comes out of your cash.
- **Money and popularity.** Faster tickets earn bigger tips and more popularity. A walkout costs 4 popularity. Popularity sets how often customers turn up.
- **Stock.** Every item uses ingredients. What's already in the queue is reserved. Each ingredient holds 2 packs, plus 1 more pack per stock shelf in the kitchen; you can't order past that. Deliveries during the day take 30–60 seconds. Orders placed between days arrive before opening. If everything on the menu is sold out and nothing is on the way, the shop has to close early.
- **Targets.** Each day has a sales target (sales plus tips) and two goals picked for that day, such as serving a number of tickets or wasting nothing. The sales target pays $100 and +3 popularity; each goal pays $60. The day summary scores you out of three stars.
- **Unlocks.** Iced milk tea and 菠蘿油 aren't on the menu until you've bought ice and butter for the first time.
- **Levels.** The stars from daily targets add up to a restaurant level (3 stars for level 2, 7 for level 3, then 12, 18, 25). Each level can open up new menu items: their station appears in the kitchen shop and their ingredients in the inventory and restock list. An item goes on the menu once you own its station and have its ingredients. Level 2 opens 奶油多 (toaster: bread, butter, condensed milk); level 3 opens 西多士 (French toast pan: bread ×2, egg, butter, syrup).

## Between days

Rearranging only happens between days: before you open, or from the end-of-day summary. Editing is drag and drop: drag a card from the catalogue into the room to buy it, drag anything already in the room to move it, and click something for a floating Rotate / Sell bar (R also rotates, Esc deselects).

- **Kitchen** (廚房): move, rotate, buy and sell appliances. Each appliance is used from the tile it faces, and the layout must keep every station reachable. The "Pro" versions cook about 35–40% faster.
- **Dining room** (裝修): furniture in three styles (老派 old school, 簡約 simple, 新派 modern), floors, wall pieces, ceiling fans and lamps. A seat only works if it faces a table and can be reached from the door; the seat count is the maximum number of customers at once. You can buy two expansions.
- **Ambience** (氣氛): every piece of decor has appeal points, and pieces of the same style multiply each other (×1.08 per extra piece, up to ×2), so a matching set beats a jumble. It's scored out of 200: the bonus grows steadily up to +50% customers and +40% tips at 200, and anything past that is bragging rights. The catalogue shows what each piece would add right now.


## Code map

| file | what's in it |
|---|---|
| `js/data.js` | every tuning number: menu, ingredients, appliances, furniture, prices, day length |
| `js/state.js` | the saved game (money, stock, layout) and localStorage |
| `js/world.js` | grid layout, pathfinding, layout validation, seat checks |
| `js/sim.js` | one day: customers, tickets, cook queue, pass, waiters, deliveries, popularity, storage |
| `js/ambience.js` | decor appeal, same-style set multipliers, and what ambience does |
| `js/iso.js` | isometric projection and drawing primitives |
| `js/art.js` | drawings of every station, piece of furniture, wall, floor, person and menu icon |
| `js/render.js` | draws a frame in depth order and returns click targets |
| `js/edit.js` | buying, placing, moving, rotating, selling |
| `js/ui.js` | the HTML panels: top bar, tickets, inventory, restock, catalogue, summary |
| `js/main.js` | loop, input, camera and the day flow (title → before opening → day → summary) |
| `js/splash.js` | the opening street scene |
| `js/tutorial.js` | the walkthrough for new games |
| `tools/server.mjs` | a tiny static dev server |
| `tools/simulate.mjs` | headless bot that plays whole days, for balancing |

## Adding a menu item

1. Add any new ingredient to `INGREDIENTS` in `data.js`.
2. Add the item to `MENU` and `MENU_ORDER`, with a `level` if it should open up later.
3. Add an appliance with `makes: '<item>'` to `APPLIANCES` (and `APPLIANCE_SHOP` if it can be bought).
4. Draw it: a case in `drawStation` and an icon in `drawIcon` (`art.js`).

## Saving

Progress is saved to localStorage at the start of each day and after anything you do before opening. A reload in the middle of a day restarts that day from its opening.
