# v10 解剖肌肉资产：来源、精度与许可

本资产来自 **Z-Anatomy / BodyParts3D 的独立解剖表面网格**。在 Blender 4.5.8 LTS 中导入、整理和导出，替换 v9 的程序椭球示意。它是可编辑的标准解剖参考体，不是当前 16 个人物的个体医学重建，也不是肌力、激活、有限元或逐肌纤维生理仿真。

## 可回查的来源

- 官方仓库：[Z-Anatomy / Models-of-human-anatomy](https://github.com/Z-Anatomy/Models-of-human-anatomy)。固定提交 `3e343336567a817ec6bdd77132ecf9672570bde7`。
- 源文件：仓库 `Z-Anatomy.zip` 中 `Z-Anatomy/Startup.blend`；原压缩包 86,734,957 bytes，完整 SHA-256 见 `source-lock.json`。下载的模板 Python 未执行，也未安装为应用模板。
- 作者许可与署名：[固定版本 License.txt](https://github.com/Z-Anatomy/Models-of-human-anatomy/blob/3e343336567a817ec6bdd77132ecf9672570bde7/License.txt)。原文保存在 `UPSTREAM_LICENSE.txt`。
- 原始 BodyParts3D 数据说明：[BodyParts3D 官方说明](https://lifesciencedb.jp/bp3d/info_en/index.html)。该项目的表面模型采用图像及解剖参考整理，并非对所有个体、结构或尺度都精确的医学真值。
- 解剖术语精确名称匹配来自同版本 `TA2.csv`。匹配成功项带 `terminology.ta2Id` 与拉丁名；没有来源 FMA 编号时 `fmaId` 保持 `null`，不会生成猜测编号。

## 文件与数据范围

- `muscles.glb`：独立肌肉与相关结缔组织 Mesh，加一个不可作为肌肉编辑的骨骼参考 Mesh。每个可编辑对象可按 `muscles.json` 的 `meshName` 查找。
- `attachments.glb`：单独的源起止附着表面。默认不显示，可按选中肌肉的 `attachmentIds` 加载对应表面；蓝绿色代表源起点材质标签，橙色代表源终点标签，紫色表示源类型不明。
- `anatomy-muscles.blend`：整理后的 Blender 源工程。`Muscles` 是评估了源厚度/细分修改器的表面；`OriginalMuscleTopology` 保存所有肌肉原始网格拓扑，默认隐藏；`SourceAttachmentSurfaces` 保存源附着表面，默认隐藏。原始细分表面可切换集合回查，未用简化几何替换肌群。
- `muscles.json`：来源名、中英显示名、侧别、区域、原始集合层级、组织类型、面数、肌腱材质分区与精确名称关联的附着参考。`asset-validation.json` 逐对象记录原始/导出面数、源修改器和坐标误差。

原源 `Muscles` 集合有 509 个独立表面对象，包含左右侧、不同肌头、肌腱、腱膜与支持性结缔组织，**不能解释为 509 块不同的人体肌肉**。各组织类型的实际计数见 `muscles.json.counts`。源起止附着集合有 705 个表面；这些标注并不全部能精确关联到一个肌肉名称，未关联的仍保留在目录中。

只提取肌肉、肌腱相关结构、骨参考及肌肉附着表面。未纳入源 README 另行标注非商业许可的内耳、肾脏，亦未复制其他器官、百科定义或应用插件。

## 坐标与显示修改

网页采用米单位、Three.js `+Y` 向上、`+Z` 向前、解剖体左侧为 `+X`，地面为 `Y=0`，规范化显示身高 1.75 m。站姿保留源模型双臂下垂姿态。GLB 根变换为正常 glTF 场景变换，不使用旧人物模型的额外 X 轴 -90° 包装旋转。

没有降面，没有生成椭球、纺锤或程序肌肉来替换原结构。保留源肌腹、肌腱的面材质分区，网页材质改为红色/象牙色顶点颜色；颜色只是清晰显示结构，不是组织测量、氧合、激活或功能量。源有厚度/细分修改器的少数薄片结构在网页版中求值，具体变化逐对象记录。

该源不提供组织学逐肌纤维重建。细长的肌腱和复杂肌腹外形来自原表面拓扑；不能把表面三角网格、显示颜色或平滑法线称为真实纤维束走向。没有将此标准体强行套入通用 53 骨角色动画。编辑的是标准网格的显示形态，肌肉模式中人物动作暂停。

## 起止附着的限制

附着对象与骨的父子关系来自原 Blender 文件。`sourceRole` 取自原材质标签，`boneSourceName` 保留原父对象名称；精确源名称与几何侧别同时吻合时才关联到肌肉。

原始资料存在少数名称后缀、几何侧别或骨侧别不一致，例如源 `Short head of biceps brachii.ol` 位于右侧并归属 `Scapula.r`。目录保留原信息并在 `issues` 中标注，未镜像或猜测更正。源材料的“起点/终点”也未经独立逐条医学复核。因此 UI 应称为“源起止附着参考”，缺失不能补成已验证的起止点。这些数据适合检索、对照、展示与形态编辑；定量解剖研究仍需核查具体结构来源。

## 许可与署名

这些提取/整理后的解剖资产以及随附目录是 Z-Anatomy 的改编，按 **Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)** 再分发。复制或分发改编资产时，保留来源、改动说明、许可及以下上游要求署名：

> BodyParts3D - The Database Center for Life Science - CC-BY-SA 2.1 Japan
>
> Z-Anatomy - The libre 3D atlas of anatomy - CC-BY-SA 4.0

作者包括 Kousaku Okubo（原始 BodyParts3D）、Gauthier Kervyn（设计、三维与解剖）及 Marcin Zielinski（Blender 工具）。本项目修改：筛选独立肌肉与相关结构、规范化坐标、保留原始拓扑、源修改器求值、显示材质转换、中文导航标签、源附着索引、网页导出与验证。

[CC BY-SA 4.0 许可](https://creativecommons.org/licenses/by-sa/4.0/)。[BodyParts3D 官方许可](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html)于 2025-02-27 更新为 CC BY 4.0；本导出使用 Z-Anatomy 改编资产，仍按其 CC BY-SA 4.0 提供，并保留其历史要求署名，不据此更改 Z-Anatomy 的许可。
