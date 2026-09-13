# 智元 D1 外观参考模型

本资产根据用户于 2026-09-08 提供的 D1 产品照片，在 Blender 中原创建模，用于 MindSpace 的机器人社会交互与专家示范展示。包含连续白色机壳、圆角前置摄像头、金属髋关节、曲线大腿、实际开孔的金属格构小腿和带几何防滑纹的黄色球形足垫。

## 资源

- `d1-reference.glb`：网页使用的模型、13 个控制骨骼、材质和 4 条动画。
- `d1-reference.blend`：可编辑模型、蒙皮、NLA 动画、预览相机和灯光。
- `d1-preview.png`：模型的实际 Blender 渲染，不是生成图片或参考照片。
- `manifest.json`：模型尺寸、摄像头位置、坐标、骨架、动画和来源。
- `blender-validation.json`：源工程重开、GLB 重导入、蒙皮和动画检查。
- `SOURCE_AND_LICENSE.md`：参考图与官方尺寸来源。

## 坐标和大小

GLB 使用米、Y 向上、正前方 +Z，绑定姿态足底 Y=0。外观比例来自单张参考照片，整体等比缩放至 **0.420 m 高**。模型实测宽约 0.375 m、长约 0.510 m，均以 `manifest.json` 为准。

智元官方 D1 Pro/Edu 页列出的站立外廓为约 635 × 360 × 420 mm；本资产只用官方高度作统一尺度参考，没有非等比拉伸模型来假装精确匹配三项参数。不同站姿、拍摄透视与图像重建会影响其他外廓尺寸；本模型不是厂商 CAD、URDF 或校准模型。

`cameraOffset` 是 GLB 模型原点到前置摄像头镜头中心的 `[x, y, z]`，用于角色第一视角。该位置按本模型外观重建，不是实机相机标定。

## 骨架和动画

骨架为 `Root` 与四条腿各三个骨骼。`FL`/`FR` 为机器人前左/前右，`RL`/`RR` 为后左/后右；每腿为 `Hip_XX → Thigh_XX → Shin_XX`。足垫是球形接触几何，随小腿运动，不额外添加脚腕控制骨骼。全部几何通过真实 Armature modifier 和权重绑定导出。

| 动画 | 时长 | 外观行为 |
| --- | --- | --- |
| `Idle` | 3.2 s | 安静站立和轻微机身姿态变化 |
| `Walk` | 1.2 s | 对角腿交替抬脚的原地步态 |
| `Greet` | 3.6 s | 抬起前左足轻摆致意，然后恢复站立 |
| `Listen` | 4.0 s | 机身轻倾，表示注意和倾听 |

四条动画均以双连杆逆运动学编排，支撑足贴地；Root 没有任何动画平移。动画使用旋转采样，不包含模型在场景中的行走距离。场景导航或交互状态机应移动外层容器并选择动画。`Thigh_*` 与 `Shin_*` 的主要屈伸轴为局部 +X。

这些动画是展示用的人工编排动作，不是学习结果、电机控制信号、真实意图识别或硬件能力验证。

## 重建和检查

在工程根目录执行：

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --python blender/d1-social/build_d1.py
/Applications/Blender.app/Contents/MacOS/Blender --background --python blender/d1-social/validate_d1.py
```

构建脚本位于 `blender/d1-social/`，也保存一份 `.blend` 和用户参考图。导出 GLB 只含机器人，不含预览地面、相机或灯光。
