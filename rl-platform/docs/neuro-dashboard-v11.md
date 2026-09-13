# v11 脑电与眼动仪表盘模块

本模块在专家示范区域显示设备桥送入的实际数据，提供实时显示和历史回放两种状态。它不生成脑电、不推断接触质量、不实现脑电解码，也不自动驱动角色。

## 交互

- 14 路 EEG 为电极通道，顺序 AF3、F7、F3、FC5、T7、P7、O1、O2、P8、T8、FC6、F4、F8、AF4。它们不代表 14 个独立脑区。实际输入必须声明通道名称；设备专有的计数器、插值标记等元数据不能当成 EEG 通道。
- 时间窗支持 2 / 5 / 10 秒；幅度支持 ±25 / 50 / 100 / 200 µV。每通道有独立基线和显示边界。默认“首点对齐”以当前时间窗第一个有效真实样本为固定显示偏移，方便查看带大直流偏置的原始 EEG；可切回“原始零线”。选中通道始终列出最近有效绝对 µV 值与显示偏移量。此操作仅改变画线坐标，原始数据不变，也不是高通、均值去趋势或清洗滤波。超量程样本仍保留在数据里，界面报告超量程数量。
- “冻结显示”保存当前显示快照，设备接收和采集仍继续；实时包率、缓存与保存数保持更新。切换 episode 或实时 / 回放状态时解除冻结，避免带入上一段数据。
- 电极图为鼻尖朝上的位置示意。CQ 与 EQ 单独选择，未知或过期质量显示空心灰点；历史质量数值保留并明确标为过期。仅明确声明 emotiv-cq-0-4 或 emotiv-eq-0-4 命名量程时使用对应等级；通用 min/max 范围只呈现数值。CQ 的 3 保持“未定义等级”，不猜测官方未说明的类别。
- 眼动单独呈现有效坐标轨迹、X / Y 时间线、左右眼有效性、瞳孔与其实际单位。未知坐标系不映射到视口，缺失瞳孔不补数值，物体 AOI 未提供时保持未知。最新信号无效或过期时移除当前光标，已记录的历史轨迹可继续显示。
- “放大信号 / 返回三维”和“收起 / 展开”只改变面板布局。原设备设置和示范标记通过明确按钮回调给专家工作区；回放状态禁用这些写入入口。解码候选只显示实际传入内容，始终注明需要人工确认。
- 测试注入数据使用 TEST_INJECTED_NOT_DEVICE_MEASURED 来源标记，顶部持续显示“测试注入”。产品没有内置示例波形按钮或信号生成器。

## 模块接入

src/neuro-dashboard.js 自行导入同名 CSS。CSS 使用 .neuro-dashboard / .nd-*，容器设置名为 neuro-dock 的宽度查询；不会操作原专家布局。

构造参数：

    new NeuroDashboard({
      container,
      store, // 可选，NeuroSignalStore 实例
      onLayoutChange({mode, visible, height}) {},
      onAction(action) {}
    })

公开接口：

- setVisible(boolean)：显示 / 隐藏；隐藏时不采样绘图。
- update(snapshot, context)：传入显示快照或更新上下文。传 null 快照可只更新上下文。
- tick(nowMs = performance.now())：由宿主渲染循环调用，可见时约 20 Hz 更新；有 store 时按当前时间窗读取最多 1600 行真实样本。
- getState()：返回显示参数（含 baseline 与所选通道 channelReadout 的绝对值 / 偏移量）、冻结状态、游标、当前电极、明细页、布局和测试标记，不包含完整原始信号。
- destroy()：解除 ResizeObserver、事件监听和 DOM。

context 支持 mode、active、actorId、episodeId、testInjection，以及完整 capture 对象：status、pendingCount、savedSignals、elapsedMs、participantId。candidate 为实际候选的 action、confidence 或 null。未提供的数字显示“—”，不会默认成零。onAction 仅可能返回 device-settings 和 mark-decision，不执行动作控制。

onLayoutChange.mode 为 split、focus 或 collapsed；推荐高度分别为 clamp(330px, 42vh, 460px)、min(74vh, 760px)、44px。宿主负责为 dock 分配高度并保留三维视窗、minimap 和专家控制栏。

仪表盘消费 NeuroSignalStore.getSnapshot 的 eeg.series、eeg.quality、gaze.rows/latest、events、clock。时间轴按 store 的 receipt / capture 时钟显示；不是已经验证的跨设备时钟同步。事件仅绘制实际记录且有时间的条目。

## 验收边界

独立 Google Chrome 验收使用真实 NeuroSignalStore 和明确标注的测试数值输入，覆盖空状态、未映射数据、通道与时间窗、量程、4200 µV 直流偏置的显示对齐且原包不变、冻结继续接收、CQ/EQ、眼动失效与过期、回放只读、HTML 转义和 1280 × 800 / 570 px 宽度布局。报告和截图保存在 work/neuro-v11-qa。

此验收不代表实体 EEG / 眼动设备已经接入，不验证人体信号真实性、µV 校准、跨硬件时延、脑区来源、解码准确率或临床用途。真实信号输入、保存和回放由宿主工作区与采集器完成，集成验收另行记录。

## 官方参考

- [EmotivPRO Raw EEG](https://emotiv.gitbook.io/emotivpro-v3/data-streams/raw-eeg)：借鉴独立通道横行、细时间网格和明确幅度控制；未复制默认显示滤波。
- [Cortex Data Sample Object](https://emotiv.gitbook.io/cortex-api/data-subscription/data-sample-object)：设备提供的 cols、质量与元数据应按各自语义处理。
- [CQ vs. EQ](https://emotiv.gitbook.io/emotivpro-v3/emotivpro-menu/contact-quality-map/contact-quality-cq-vs.-eeg-quality-eq)：接触质量和 EEG 质量需要区分。
