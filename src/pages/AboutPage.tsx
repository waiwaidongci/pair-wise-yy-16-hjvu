import { Link } from "react-router-dom";
import { getPhoto } from "../data/photos";
import { AspectImage } from "../components/AspectImage";
import { useLightbox } from "../lightbox/LightboxContext";

const TIMELINE: { year: string; event: string }[] = [
  {
    year: "2014",
    event:
      "Began photographing people around her on black-and-white film; first portrait studies.",
  },
  {
    year: "2017",
    event:
      "Started the portrait series The Gaze, a continuing record of openness and guardedness before the camera.",
  },
  {
    year: "2019",
    event:
      "First expedition into the high-altitude no-man's-land, beginning the Wilderness landform record.",
  },
  {
    year: "2021",
    event:
      "Long stays on highland pastures, completing the everyday nomadic imagery of Highland Pastoral.",
  },
  {
    year: "2024",
    event:
      "The three series exhibited together as a collection at an independent photography space.",
  },
];

export function AboutPage() {
  const { open } = useLightbox();
  const portrait = getPhoto("portrait-01");

  return (
    <div className="container about-page">
      <div className="about__columns">
        <div className="about__portrait">
          {portrait && (
            <button
              type="button"
              className="about__portrait-frame"
              aria-label={`View photograph: ${portrait.title}`}
              onClick={() => open([portrait], 0)}
            >
              <AspectImage photo={portrait} loading="eager" />
            </button>
          )}
        </div>

        <div className="about__content">
          <h1 className="page-title">About</h1>

          <div className="about__bio">
            <p>
              Lin Zhao is an independent photographer moving between the city
              and the high plateau. Her lens stays on two long-term subjects:
              intimate black-and-white portraits of people, and the natural
              scenery and pastoral life of the plateau regions.
            </p>
            <p>
              In The Gaze she watches eyes and skin texture at very close
              range; in The Wilderness she waits for brief convergences of
              mist, light, and ridgelines; in Highland Pastoral she places
              herself inside the daily rhythm of the pastures, recording the
              quiet coexistence of herds, wooden cabins, and people.
            </p>
          </div>

          <section className="timeline" aria-label="Career timeline">
            <h2 className="timeline__heading">Timeline</h2>
            <ol className="timeline__list">
              {TIMELINE.map((item) => (
                <li key={item.year} className="timeline__item">
                  <span className="timeline__dot" aria-hidden="true" />
                  <span className="timeline__year">{item.year}</span>
                  <span className="timeline__event">{item.event}</span>
                </li>
              ))}
            </ol>
          </section>

          <div className="about__contact-cta">
            <Link to="/contact" className="text-link">
              For commissions, please leave a message on the contact page →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
