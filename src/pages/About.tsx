import { Link } from "react-router-dom";
import SmartImage from "../components/SmartImage";
import { getPhoto } from "../data/photos";

// 摄影师形象照（取自数据集中的肖像系列）
const PORTRAIT = getPhoto("portrait-05");

const TIMELINE = [
  { year: "2013", text: "开始以黑白胶片拍摄身边的人，完成第一组肖像练习。" },
  { year: "2017", text: "作品《呼吸之间》入选青年摄影群展，专注于特写肖像。" },
  { year: "2020", text: "第一次前往高原牧场，开启长期拍摄计划「无人之境」。" },
  { year: "2024", text: "完成《凝视》《无人之境》《高原牧歌》三个系列的整理与出版。" },
];

export default function About() {
  return (
    <div className="page page--about">
      <div className="about__layout">
        <div className="about__portrait">
          <SmartImage photo={PORTRAIT} loading="eager" />
        </div>

        <div className="about__content">
          <h1 className="page__title">关于</h1>

          <div className="about__bio">
            <p>
              我是林予安，一名工作于城市与高原之间的独立摄影师。
              我的镜头长期停留在两类题材上：黑白的人物特写，
              以及高海拔地区的地貌与牧场生活。
            </p>
            <p>
              在《凝视》系列里，我使用极近的景别去逼近眼神与皮肤的纹理，
              记录坦露与防备同时出现的瞬间；在《无人之境》与《高原牧歌》中，
              我则试着把节奏放慢，让雾气、山脊和牛群自己决定画面。
            </p>
          </div>

          <div className="gold-rule gold-rule--left" aria-hidden />

          <h2 className="about__subheading">经历</h2>
          <ol className="timeline">
            {TIMELINE.map((item) => (
              <li key={item.year} className="timeline__item">
                <span className="timeline__dot" aria-hidden />
                <span className="timeline__year">{item.year}</span>
                <span className="timeline__text">{item.text}</span>
              </li>
            ))}
          </ol>

          <div className="gold-rule gold-rule--left" aria-hidden />

          <p className="about__contact-hint">
            拍摄合作、作品收藏或只是聊聊照片，
            <Link to="/contact" className="about__contact-link">
              欢迎给我留言
            </Link>
            。
          </p>
        </div>
      </div>
    </div>
  );
}
