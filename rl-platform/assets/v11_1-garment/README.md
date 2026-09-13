# P14 马甲局部修复 · v11.1

已在 Blender 4.5.8 LTS 中完成实际几何和蒙皮修复。交付使用 `public/assets/p14-garment-v11_1.glb`；原 `p14.glb` 和其它 15 人资产未覆盖。

## 诊断与修复

原马甲后片只有 38 顶点、18 面，固定的后片位置低于部分白衬衫表面；肩带各仅 6 顶点、2 面，整体绑定 spine_03，无法贴合肩部。新的后片、侧缝回包和两个肩部面片直接从原衬衫三角面裁出，沿表面法线外移 8 mm，并插值转移同源蒙皮权重。后片侧缘延伸到原前片下方，覆盖端盘时原侧缝缺失的白色楔形。

只替换 `p14_vest_back`、`p14_vest_shoulder_-1`、`p14_vest_shoulder_1` 三个网格。原马甲前片、衬衫、袖子、领口、围裙和其它人物保持原样。未关闭 depth test，未调整 renderOrder，未隐藏衬衫；这是一项服装表面拟合修复，并非布料物理模拟。

Blender 先导出候选模型，再将这三个网格的几何和蒙皮顶点数据合并到原 GLB。原节点、skins、动画 JSON、全部原 accessor/bufferView 和原二进制内容完整保留，因此骨骼、bind matrices、轨道目标、关键帧数值与时长不受重新烘焙影响。

## 交付与验证

- `p14-garment-v11_1.glb`：页面实际加载的新模型，位于本目录上一级。
- `p14-garment-v11_1.blend`：压缩的独立 P14 源工程；已用 Blender 重新打开，53 骨骼、27 个 KPT 对象、12 条 NLA 动作仍在。
- `repair-report.json`：来源 SHA、16 原人物文件 SHA、三个局部网格修改记录。
- `preservation-validation.json`：原二进制、动画、绑定、材质、其它网格的逐项一致性核对。
- `browser-report.json`：Chrome 真实加载原版与修复版，4 个动作 × 3 个时刻 × 2 个观察角度，共 24 张对比截图，零运行时错误。
- `Idle/Walk/Carry/Serve-*-back/side.png`：真实 Blender Cycles 渲染；帧 0、15、30。
- `browser-*.png`：Three.js 中的原版/修复版对比，左为原始 P14，右为修复 P14。

已查看 Idle、Walk、Carry、Serve 的背面与侧后截图：原先大片白衬衫穿出马甲的问题消除，侧缝白色缺口已覆盖，正常领口与袖子保留。模型转身时面片随原骨骼一起变换。53 根骨骼与以下 12 条动作完整保留，每条 159 通道：Idle、Walk、Run、Wave、Sit、Carry、TakeOrder、Serve、Greet、Guide、Listen、WipeTable。用户后续自行施加的极端骨骼偏移不在这些原动作的验收范围内。

新 GLB SHA256：`0a8529e1d15b18d3794a62b8b4f1b6b176269198f96087b94326dcfa631d25f7`。
原 P14 SHA256：`85d354297375dbd3c93c4ba2de4658f40bbf26871d3f1db5103b6a89350c1bcc`。
原完整 Blender 工程 SHA256：`810295b44fede385940cce4791574d7569af490fa88abac80a59d840e09f3d15`。

## 重建

从应用根目录运行：

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --python blender/v11_1-garment/repair_garment.py
python3 blender/v11_1-garment/validate_glb.py
```

构建脚本只读 `public/assets/human-layer.blend` 与原 `p14.glb`，使用现有 `blender/restaurant-actions/restaurant_animations.py` 切换渲染姿势。`inspect_garment.py` 为原网格诊断脚本。`browser-preview.html` / `browser-qa.mjs` 是独立验收工具，在应用根目录 `python3 -m http.server 5231 --bind 127.0.0.1` 后使用；它们不会修改仿真页面或录制数据。
