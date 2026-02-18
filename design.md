check if this discord bot adheres to 'spread jam on bread' idea and its loop completionness

players have 1 bread and 1 jam. goal: get highest lvl bread in server

bread starts at lvl 1 with a points meter. 

points are gained from jam 'spreading' to other players' bread ie:
when player sends a regular chat message, the next N messages (by other ppl) given the player N/N, (N-1)/N, ..., 1/N points. (immediate next message gives 1 point, N-th later msg gives 1/N). 
players can see how many points they have rn, and also a jam meter. at some point the player can level up their bread by 1 level; but if they wait, there are increasingly smaller windows in which the player can upgrade to gain more than 1 level; for example, upgrading at 0-200: not ready; 201-250: +1 lvl 250-275:+2 lvl, 275-290: +4 lvl, 290-295: +10 lvl, 295-299: +20 lvl, 299-300: +50 lvl; beyond 300 = point meter resets, and player loses 10% of their levels on the bread.

in the embed/output, players only see a jam amount, so each range is converted into plain english and shown as a jam meter. every time the meter is reset or the bread levels up, the ranges are randomized; players never know which is the 'perfect' range and must either play it safe or play it fast. 
how to generate ranges: start with the max value (i.e. 300), then create a normalized base range [0 to 1]; repeat this several times:
for a starting range A to B, select random number N btwn 0.5 and 1; then it gets split into two ranges: [A, lerp(A, B, N)] and [lerp(A,B,N), B]. repeat for the latter created range ([lerp(A,B,N), B]).

max levels gained at once: likekly +50, so a perfect one is +50. 

at milestones, the bread 'upgrades' aesthetically: start from plain bread, then i.e. level 5 gives whole wheat, level 10 gives crossiant, etc; have a few aesthetics throughout, with the max at level 10000. (of course, if player loses levels, their aesthetic drops back down. aesthetic is only calculated when level is retrieved).

additionally, players get one free jam boost every day; each jam boost lasts for 15 mins, and triples the amount of points that this player gives to other playesr. for example, if player A (with boost active) sends a message immediately after player B, then player B would gain 3 * N/N = 3 points. this is intentional double edged sword, ie can help everyone level up faster, but also makes it riskier to do a mega level up.

input cmds:
/bread: show bread and hotness status
/upgrade: tries to upgrade
/leaderboard: shows server leaderboard of highest bread levels

admin cmds:
/admin channels [list]: list of channels where this is allowed
tehcnically should be simple, bettersqlite3 and tracking the last N (i.e. N=10) messages in that channel

because a single person can't spread points to their own bread, it intentionally forces ppl to start talking