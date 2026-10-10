import { Composition, Still } from "remotion";
import { BrowseView } from "./Site";
import { Promo, PromoProps, TOTAL } from "./Promo";

export const FrozenBrowse: React.FC = () => (
  <div
    style={{
      width: 1920,
      height: 1080,
      background: "#fff",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        width: 1280,
        height: 680,
        transformOrigin: "0 0",
        transform: "scale(1.5)",
      }}
    >
      <BrowseView
        f={400}
        scrollAt={() => 330}
        curAt={() => ({ x: -999, y: -999 })}
        menuAt={9999}
        filterAt={9999}
      />
    </div>
  </div>
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Promo"
      component={Promo}
      durationInFrames={TOTAL}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ useVoiceover: true } satisfies PromoProps}
    />
    {/* Source frame for public/impact-bg.jpg (blurred with ffmpeg, see README) */}
    <Still
      id="FrozenBrowse"
      component={FrozenBrowse}
      width={1920}
      height={1080}
    />
  </>
);
