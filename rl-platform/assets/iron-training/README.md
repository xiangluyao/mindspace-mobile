# IRON 外观参考训练模型

此资产在 Blender 4.5.8 中按用户提供的小鹏 IRON 外观图片进行原创建模，供当前训练页交互预览使用。它是外观与运动学原型，不是小鹏原厂 CAD、URDF 或经过硬件标定的动力学模型。

## 文件

- `iron-prototype.glb`：网页可直接加载的二进制 glTF，含材质、嵌入贴图、骨架和四条动作。
- `iron-prototype.blend`：可继续编辑的 Blender 工程，已打包织物法线贴图，包含独立预览灯光与相机。
- `iron-preview.png`：本资产的实际 Blender 渲染预览。
- `manifest.json`：模型尺寸、坐标、骨架、动作与用途边界。
- `blender-validation.json`：Blender 工程重开及 GLB 重导入检查结果。
- `micro-knit-normal.png`：原创程序生成的细织纹法线贴图，GLB 与 Blend 已内嵌。

## 网页控制合同

glTF 使用米制、Y 向上、正面朝 +Z，双脚站立时脚底为 Y=0。左右名称按机器人自身左右命名，L 在模型 +X 一侧。

主骨架为 `Root / Pelvis / Spine / Chest / Neck / Head`，以及左右各自的 `UpperArm_`, `Forearm_`, `Hand_`, `Thigh_`, `Shin_`, `Foot_`。

运行时覆盖姿态时，先停止动画混合器，保存并恢复各骨骼的绑定四元数，再乘以局部旋转增量。腿与手臂的正局部 X 旋转指向身体前方；膝关节向后弯曲采用负局部 X。不要将骨骼静态 `rotation` 强制清零。

`Idle`、`Walk`、`Squat`、`Reach` 是原地动画。Root 只有竖直方向的支撑脚贴地补偿，场景中的水平路径应由外层人物组控制。四条动作均为设计的运动学轨迹，不表示已经训练完成的策略。

模型共有 18 个控制骨骼。手指有独立分节几何，但当前随 Hand 骨整体运动，未增加手指独立控制自由度。
