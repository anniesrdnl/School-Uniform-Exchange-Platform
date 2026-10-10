# School Uniform Exchange: 60-second promo (Remotion)

1920x1080, 30 fps, 1800 frames (60 s). Concept: *Your old uniform. Someone else's new beginning.*

| Time | Scene | On-screen text |
|---|---|---|
| 0:00-0:07 | Hook (dark background, lines appear one by one) | Old uniform? → Still usable? → Why let it go to waste? |
| 0:07-0:15 | Introduction (homepage, slow zoom to logo and heading) | Introducing School Uniform Exchange |
| 0:15-0:27 | Browse (scroll cards, open a listing, save it) | Browse. Discover. Save. |
| 0:27-0:39 | Sell / exchange (photo, details, post) | List it. Sell it. Exchange it. |
| 0:39-0:50 | Impact (blurred site + animated icons) | Save Money • Reduce Waste • Help Students |
| 0:50-1:00 | Call to action (homepage → closing screen) | Your Uniform. Their Opportunity. |

## Commands

```bash
npm install
npm run dev                                   # Remotion Studio
npx remotion render Promo out/promo.mp4       # final render
python3 scripts/music.py                      # regenerate public/music.mp3
```

## What's in the video

- **Website scenes** are recreated in React from the real pages (`src/Site.tsx`, same palette, Poppins font, logo and layouts
  as `client/`). The listing photos are crops of `client/src/assets/uniforms.jpg`. To use real screen recordings instead,
  drop the clips into `public/` and swap the `<Window>` contents in `src/Promo.tsx` for `<OffthreadVideo src={staticFile("clip.mp4")} />`.
- **Music** is a synthesized 60 s bed (`scripts/music.py`) with a hit on every scene change.
- **Voice-over** is shown as word-by-word subtitles. To add a real voice-over, record one file per scene
  (`public/vo/scene1.mp3` … `scene6.mp3`, scripts are in `VO` in `src/Promo.tsx`), then render with
  `npx remotion render Promo out/promo.mp4 --props='{"useVoiceover":true}'` (music ducks automatically).
