/**
 * Pi Agent 安装与使用实践 —— 两页 16:9 可编辑演示文稿
 *
 * 运行方式（Windows，本项目目录下）：
 *   set NODE_PATH=D:\Pi-Agent\pptx-runtime\node_modules
 *   D:\Node.js\node.exe ppt-output\generate.js
 *
 * 事实来源：本项目 README.md、hello.py 与 images/ 截图，未添加虚构数据。
 * 依赖：pptxgenjs（本机原先缺失，已安装到 D:/Pi-Agent/pptx-runtime）
 */
"use strict";

const fs = require("fs");
const path = require("path");
const PptxGenJS = require("pptxgenjs");

const OUT_DIR = __dirname;
const OUT_FILE = path.join(OUT_DIR, "Pi-Agent-两页实践展示.pptx");

if (fs.existsSync(OUT_FILE) && !process.argv.includes("--force")) {
  console.error("输出文件已存在，未覆盖：" + OUT_FILE);
  process.exit(1);
}

const FONT = "微软雅黑";
const NAVY = "1E2761"; // 深蓝标题
const INK = "22262E"; // 正文墨色
const MUTED = "4A5568"; // 次级正文
const WHITE = "FFFFFF";

const pres = new PptxGenJS();
// 必须在使用 addSlide 之前设置版面：13.333 x 7.5 英寸（16:9）
pres.layout = "LAYOUT_WIDE";
pres.author = "pi-agent 实践";
pres.title = "Pi Agent 安装与使用实践";

/** 统一段落样式，避免共享对象被 pptxgenjs 原地改写 */
function para(text, opts) {
  return Object.assign(
    {
      text,
      options: {
        fontFace: FONT,
        fontSize: 22,
        color: INK,
        breakLine: true,
        paraSpaceAfter: 18,
      },
    },
    opts || {}
  );
}

// ---------------------------------------------------------------- 第 1 页
const s1 = pres.addSlide();
s1.background = { color: WHITE };

s1.addText("Pi Agent 安装与使用", {
  x: 0.8,
  y: 0.6,
  w: 11.7,
  h: 1.0,
  fontFace: FONT,
  fontSize: 40,
  bold: true,
  color: NAVY,
  align: "left",
  valign: "middle",
  margin: 0,
});

// 左栏：版本与运行环境
s1.addText("版本与运行环境", {
  x: 0.8,
  y: 1.95,
  w: 5.3,
  h: 0.55,
  fontFace: FONT,
  fontSize: 24,
  bold: true,
  color: NAVY,
  margin: 0,
});

s1.addText(
  [
    para("Pi 1.5.0，基于 Node.js 24.18.0 与 npm 11.16.0", { bullet: true }),
    para("程序、配置和缓存主要放在 D 盘", { bullet: true }),
    para("练习项目位于桌面“开源软件作业\\pi-agent”", {
      bullet: true,
      breakLine: false,
    }),
  ],
  {
    x: 0.8,
    y: 2.6,
    w: 5.3,
    h: 3.9,
    fontFace: FONT,
    fontSize: 22,
    color: INK,
    align: "left",
    valign: "top",
    margin: 0,
    lineSpacingMultiple: 1.3,
  }
);

// 右栏：DeepSeek 对话与模型切换
s1.addText("DeepSeek 对话与模型切换", {
  x: 6.6,
  y: 1.95,
  w: 5.95,
  h: 0.55,
  fontFace: FONT,
  fontSize: 24,
  bold: true,
  color: NAVY,
  margin: 0,
});

s1.addText(
  [
    para("通过 /login 配置 API Key，接入 DeepSeek", { bullet: true }),
    para("向 deepseek-v4-pro 提问并收到回复", { bullet: true }),
    para("通过 /model 切换为 deepseek-flash 后继续提问", {
      bullet: true,
    }),
    para("通过 /thinking 将思考级别由 off 调为 low", {
      bullet: true,
      breakLine: false,
    }),
  ],
  {
    x: 6.6,
    y: 2.6,
    w: 5.95,
    h: 3.9,
    fontFace: FONT,
    fontSize: 22,
    color: INK,
    align: "left",
    valign: "top",
    margin: 0,
    lineSpacingMultiple: 1.3,
  }
);

s1.addNotes(
  "Pi 1.5.0 安装与首次使用：D 盘环境、DeepSeek 登录、pro 与 flash 模型切换、思考级别调整。"
);

// ---------------------------------------------------------------- 第 2 页
const s2 = pres.addSlide();
s2.background = { color: WHITE };

s2.addText("实践验证结果", {
  x: 0.8,
  y: 0.6,
  w: 11.7,
  h: 1.0,
  fontFace: FONT,
  fontSize: 40,
  bold: true,
  color: NAVY,
  align: "left",
  valign: "middle",
  margin: 0,
});

const rows = [
  ["hello.py 输出 5", "@hello.py 引用代码，模型解释 add(a, b)，实际输出 5。"],
  ["图片识别", "Alt+V 粘贴剪贴板图片，模型识别出蓝色方块和数字 7。"],
  ["pi-web-access 读取网页", "安装并重启加载插件，成功读取 example.com。"],
  ["pptx Skill 项目级安装", "安装到 .pi/skills/pptx，重启后 [Skills] 显示 pptx。"],
  ["pptx Skill 实际调用", "执行 /skill:pptx，返回技能名称、用途和正确目录。"],
];

let y = 1.9;
const rowHeight = 0.6;
rows.forEach(function (row) {
  s2.addText(
    [
      {
        text: row[0],
        options: { fontFace: FONT, fontSize: 24, bold: true, color: NAVY },
      },
      {
        text: "：" + row[1],
        options: { fontFace: FONT, fontSize: 22, color: MUTED },
      },
    ],
    {
      x: 0.8,
      y: y,
      w: 11.7,
      h: rowHeight,
      fontFace: FONT,
      fontSize: 22,
      color: MUTED,
      align: "left",
      valign: "top",
      margin: 0,
      lineSpacingMultiple: 1.15,
    }
  );
  y += 1.0;
});

s2.addNotes(
  "五项验证均为本项目已完成的事实：代码输出 5、图片识别蓝色方块与数字 7、网页读取、Skill 安装与调用。"
);

pres.writeFile({ fileName: OUT_FILE }).then(function () {
  console.log("已生成：" + OUT_FILE);
  console.log("页数：2，版面：16:9（13.333 x 7.5 英寸）");
});
