# 餐厅场景来源与许可

本项目当前资产来自下述派生链。文中的 v3 数值记录移除机器人前的纹理优化基线；当前 v4 修改及hash见文末。本轮进一步制作运行版，将内嵌 WebP 纹理最长边限制为 512 px，降低双窗口使用时的纹理内存；相对于网页衍生版，几何压缩数据及节点、材质等 JSON 保持不变。原始 Blender / GLB / USDC 和历史网页衍生文件均未修改。

## 原始交付与网页衍生

用户指定版本在任务 `01a02372-d0a2-77d3-9138-f144ed3b4ef5` 的 turn `01a03744-e9e2-7153-b59b-ecbc0d9eebd4` 于 **2026-08-25 13:49:40，Asia/Shanghai** 交付。当时交付的是独立 Blender / GLB / USDC 模型，未接入 HTML。

原目录：`/Users/luyao/Documents/餐饮落地/MindSpace_开放餐厅整合模型_v2`。原件含 Bistro 前厅、商业后厨、两台黑色人形机器人、任务区和仿真元数据；完整墙体与默认展示剖切保留在 Blender 层级中。

历史网页衍生来源：`/Users/luyao/Documents/餐饮落地/MindSpace_餐饮机器人训练仿真平台_3D场景人物接入_v7/assets/3d/restaurant_web.glb`。该文件修改时间为 **2026-08-25 19:49:09 +08:00**，用作网页衍生生成时间的本地证据；GLB 内没有独立的导出时间字段。

- 文件大小：26,365,464 字节。
- SHA-256：`e60a1bb35cc5eae0d7a392299f928caaf71690d53f78145acb0fc759f42a0002`。
- 三个原件的实际 SHA-256 已与原 `VALIDATION.md` 一致核验，完整路径、大小和 hash 见 `public/assets/restaurant-source.json`。
- 模型与纹理资源内嵌。网页文件声明 Meshopt 压缩、WebP 贴图、网格量化与 GPU 实例化；加载器需要配置 `MeshoptDecoder`。

## v3 纹理运行版派生

派生链为 **13:49 原始模型 → 19:49 历史网页衍生 → 本轮 512 px 纹理运行版**。本轮分发文件的实际数据如下：

- 文件：`public/assets/restaurant-scene.glb`，**11,376,004 字节**。
- SHA-256：`f9fad5b7bde4ca86662725e3d2ebdab59eaf16fdc245214e8366297abc1538a6`。
- 105 张内嵌纹理保持 WebP，最长边不超过 512 px；大于 512 px 的图像按原比例缩小并重新编码，近距离纹理细节相应减少。
- 所有 Meshopt 压缩几何 payload 字节保持不变；`nodes`、`meshes`、`accessors`、`skins`、`animations`、`scenes`、`materials`、`textures` JSON 逐项一致。重新打包只更新图像数据及相关二进制偏移。
- 实际 Three.js GLTFLoader + MeshoptDecoder 解码得到 114 个 mesh、1,009,088 个展开顶点样本；紧致世界包围范围与历史网页衍生一致。
- 按 RGBA8 加完整 mip 链估算，场景纹理约从 **2,103.57 MB** 降到 **135.90 MB**。这是单份解码纹理的分配估算，不是浏览器实测 GPU 总内存，也不包括人物、渲染缓冲及其他开销。
- 转换逐图记录见 `examples/restaurant-validation/texture-optimization.json`；完整派生元数据见 `public/assets/restaurant-source.json` 的 `runtimeDerivative`。

本节的几何字节保留是v3 纹理运行版与历史网页衍生之间的比较，不表示历史网页优化前后逐顶点相同。纹理转换不改变已有许可。

网页显示时，`semantic_class = task_zone` 的任务区域代理保持在场景数据中，但隐藏且不参与选择，以免代理平面遮挡真实地板。这些对象是任务元数据；布局碰撞与初始射线检查也排除它们。该显示设置不删除 GLB 节点或改变建筑、家具几何，不代表每个节点同时可见。

## Amazon Lumberyard Bistro：CC BY 4.0

- 原资产：Amazon Lumberyard Bistro 内部场景。
- 创作者 / 发布者：**Amazon Lumberyard**。
- 分发来源：**NVIDIA Open Research Content Archive（ORCA）**。
- 来源：https://developer.nvidia.com/orca/amazon-lumberyard-bistro
- 许可：**Creative Commons Attribution 4.0 International（CC BY 4.0）**。
- 许可链接：https://creativecommons.org/licenses/by/4.0/
- 随包许可全文：`licenses/Bistro-CC-BY-4.0.txt`，从原 Bistro `LICENSE.txt` 逐字节复制，保留原有免责声明。

既有修改包括展示剖切、商业后厨整合、场景组织，以及网页版本的贴图转换、压缩、实例化和量化。本轮新增运行版的 512 px 纹理缩小与重新编码。再分发本资产时应保留上述创作者、来源、许可、免责声明和修改说明；本项目不表示得到 Amazon 或 NVIDIA 的认可。

## CC0 设备与项目新增内容

原整合项目的 `ATTRIBUTION.md` 记载：后厨扩展中的 **两件电器网格**来自此前纳入的 **CC0 Home Kitchen** 资产，其 Blender 对象带有 `source_license = CC0` 属性。该来源范围限于这些部件，整个 Bistro 场景仍含 CC BY 4.0 内容。

商业后厨扩展、黑色人形机器人、语义区域、相机、灯光、场景组织和仿真元数据由原 MindSpace 项目制作。本说明记录其来源，不重新指定这些项目新增内容的许可。

## 几何统计与验证范围

以下统计实际读取原始及历史网页衍生 GLB 的 JSON 节点、网格、primitive 和 accessor 数据。两个文件的 primitive 均为 `TRIANGLES`。v3 纹理运行版保留历史网页衍生的几何与实例结构，因此继承右列统计。

| 统计项 | 13:49 原始 GLB | 网页衍生 GLB |
| --- | ---: | ---: |
| Mesh | 1,498 | 85 |
| Primitive | 2,393 | 114 |
| Node | 1,511 | 89 |
| 含 mesh 的节点 | 1,498 | 85 |
| GPU 实例节点 | 0 | 14 |
| GPU 实例数量 | 0 | 135 |
| 全部网格引用实例数（普通节点 + GPU 实例） | 1,498 | 206 |
| 每个独立 mesh 计一次的三角形数 | 1,246,311 | 1,164,507 |
| 按默认场景节点与实例展开的三角形数 | **1,246,311** | **1,246,311** |

网页文件减少了独立记录并使用实例化；因此 mesh、primitive 和 node 数量不再直接对应原版对象数量。计入 `EXT_mesh_gpu_instancing` 后，两者场景三角形总数相同。这项检查没有解码压缩顶点做逐顶点比较，也没有验证拓扑、位置、法线、UV、材质或贴图像素完全相等；不能把相同的三角形数量表述为逐顶点一致。

## v4 真实餐厅服务版

当前派生链继续为 **v3 512 px 纹理运行版 → v4 移除机器人版**。运行文件为 `public/assets/restaurant-scene.glb`，11,961,520 字节，SHA-256 `41c0f9b58606c081982cca4a12c4f998befdfa56028a0457156e6815f67ef8a4`。

以原始 GLB 中 `Black_Humanoid_Robot_Kitchen`、`Black_Humanoid_Robot_Dining` 两个层级的104个网格为依据，逐一匹配并移除54,400个机器人三角形；量化网页几何的最大匹配偏差小于0.981mm。所有原顶点属性、法线、UV和图像二进制保留，更新索引、GPU实例引用，并将仍含餐具的合并节点改为餐厅材质批次名称。没有按整个合并网格或大包围盒删除家具。

Three.js GLTFLoader + MeshoptDecoder 复核为102个可渲染mesh、1,191,911个展开三角形，即1,246,311减去54,400。原始Blender / GLB / USDC及旧版ZIP未改。应用另行移除R01加载逻辑，由p14–p16服务人员承担交互；Human Layer与Perspective窗口读取同一份v4场景。

详细证明见 `examples/service-validation/robot-removal-report.json`、`no-robots-decode-qa.json`。上文v3几何统计是移除前基线，不代表当前v4仍包含机器人。
