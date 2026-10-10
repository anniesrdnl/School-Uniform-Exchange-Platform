import { Composition } from "remotion";
import { Promo, PromoProps, TOTAL } from "./Promo";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Promo"
    component={Promo}
    durationInFrames={TOTAL}
    fps={30}
    width={1920}
    height={1080}
    defaultProps={{ useVoiceover: true } satisfies PromoProps}
  />
);
