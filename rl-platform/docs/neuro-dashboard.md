# 专家示范：脑电与独立眼动实时面板（v11）

本面板用于查看设备桥实际送达的原始数据、信号状态及采集时间线。本轮没有连接真实 EEG 头戴设备或眼动仪；验证使用明确标记的测试注入。没有真实数据时，波形、质量、瞳孔和注视位置保持为空，不播放假脑电或把仿真人物状态解释为真人生理状态。

界面参考 EMOTIV 官方 EmotivPRO 的原始脑电视图，当前实现不是 EmotivPRO，也不自动完成 Cortex 授权、头戴设备配置或眼动校准。它不实施滤波、去伪迹、重参考、FFT、频段功率、情绪或意图解码。

## 官方界面参考与布局依据

2026-09-07 实际打开并查看了 [EmotivPRO v3.0 的 Raw EEG 官方页面](https://emotiv.gitbook.io/emotivpro-v3/data-streams/raw-eeg)及其嵌入软件截图：主区域为 14 条独立横行，左侧有通道名与显示间距，底部有时间刻度，顶部保留设备/质量状态，右上可切换可见通道。官方示例图本身标注了模拟设备，不能把它当成真实硬件已连接的证据。这是当前仍公开提供的官方文档界面参考，未运行用户安装的 EmotivPRO，也不把文档目录的“v3.0”当作所有桌面版本的最新版本号。

本项目采用的信息布局：

- 顶部保留“实时 / 回放 / 测试注入”状态、独立的 EEG 与眼动连接状态、最近接收时间，以及已声明的采样率和单位。
- 脑电采用紧凑的 14 行堆叠曲线，共享时间轴；显示缩放和通道显隐仅改变画面。未映射、单位未知或缺失通道均显示明确空态。
- 接触质量 CQ 和脑电质量 EQ 分开选择，头图只表示电极位置与收到的质量类别。头图鼻尖朝上、标明左右；二维电极位置是显示示意，不是头部配准或脑源定位图。
- 独立眼动区域显示实际注视坐标与轨迹、追踪有效性及桥提供的左右眼/瞳孔数据，不把头图、电极值或 EPOC 面部动作当成眼动仪数据。
- 采集时间和场景时间同时可辨识。暂停场景或打开资料库不伪造脑电平线，也不把继续接收的设备数据压缩到同一个场景时刻。

官方 Raw EEG 文档包含默认启用的 0.16 Hz 高通显示；本项目只参考其信息组织，不复制这项信号处理。图形的像素映射、显示基准和缩放不能改写保存的原数据。需要导出分析时，使用原始信号包。[官方 Raw EEG 显示说明](https://emotiv.gitbook.io/emotivpro-v3/data-streams/raw-eeg)

## 14 通道与设备版本

EPOC / EPOC+ / EPOC X 的 14 通道显示顺序为：

```text
AF3, F7, F3, FC5, T7, P7, O1, O2, P8, T8, FC6, F4, F8, AF4
```

这些名称用于固定显示槽位；输入数组可以重排，但必须显式附带 `channels`。Cortex 桥必须以订阅成功返回的 `cols` 对齐数据，不按固定数组切片猜位置。`COUNTER`、`INTERPOLATED`、`RAW_CQ` 和标记字段都不属于这 14 个脑电通道。[Cortex subscribe](https://emotiv.gitbook.io/cortex-api/data-subscription/subscribe)

CMS/DRL 是参考/共模抑制电极，不能作为第 15、16 条普通 EEG 通道显示。EPOC X 文档允许 P3/P4 与乳突位置的参考配置，实际位置应由设备配置记录，不能从人物模型推断。[EPOC X 技术规格](https://emotiv.gitbook.io/epoc-x-user-manual/introduction/technical-specifications)、[参考电极位置](https://emotiv.gitbook.io/epoc-x-user-manual/getting-started/changing-reference-sensor-location)

采样率不是“所有 EMOTIV 设备都固定 256 Hz”：

| 文档配置范围 | EEG 采样率与分辨率 |
| --- | --- |
| EPOC 模式 | 128 Hz，14 bit |
| EPOC+ / EPOC X 的 EPOCPLUS 模式 | 可配置 128 或 256 Hz，16 bit |
| Cortex 文档描述的蓝牙兼容配置 | EEG 128 Hz；不能由这条规则推断所有未来固件的能力 |

这些限定来自 [Cortex updateHeadset](https://emotiv.gitbook.io/cortex-api/headset/updateheadset)。桥应保留实际 `headset.settings.eegRate/eegRes/mode`、型号、固件与连接方式；以当前设备返回值为依据。[Headset object](https://emotiv.gitbook.io/cortex-api/headset/headset-object) 当前显示适配器只接受已声明的 128/256 Hz；这是一项实现范围，不代表对其他设备能力的判断。页面中的时间窗或显示密度不能改变设备采样配置。

## CQ、EQ 与未知状态

CQ 反映接触/阻抗相关状态，不是脑电幅度，也不是原始欧姆数。良好 CQ 不保证高质量脑电。EQ 是 EMOTIV 根据多项输入提供的信号质量结果；本页面不重新实现其质量算法。[官方 CQ 与 EQ 区别](https://emotiv.gitbook.io/emotivpro-v3/emotivpro-menu/contact-quality-map/contact-quality-cq-vs.-eeg-quality-eq)

| 数据 | 来源及表示 | 面板含义 |
| --- | --- | --- |
| 通道 CQ | Cortex `dev` 内的通道质量；类别范围 0–4 | 官方说明列 0 黑/很差、1 红/差、2 橙/一般、4 绿/好；值 3 若出现，保留原值，不套用 EQ 的类别名称 |
| 通道 EQ | Cortex `eq`；0–4，Cortex 2.7.0 起提供 | 0 黑、1 红、2 橙、3 浅绿、4 深绿；属于有序质量类别，不是准确率或置信概率 |
| Overall CQ / EQ | 相应源流中的 0–100 值 | 若桥提供则保留，不用通道平均值冒充源总体分数 |
| Sample Rate Quality | 源 `eq.sampleRateQuality`，通常 0–1 | 衡量近期数据到达完整性；特殊值 `-1` 表示最近 2 秒中丢失超过 300 ms，不显示为负百分比 |
| 无值或量程不明 | 缺失、`null`、未声明 scale | 保持“未知”，不当作 0，也不填绿色 |

范围、特殊值及版本依据：[Cortex data sample object](https://emotiv.gitbook.io/cortex-api/data-subscription/data-sample-object)。官方详细 EQ 说明使用最差三通道解释总体分数，另有旧版简述写作平均；本项目直接保留源整体值，避免跨版本自行重算。[官方详细质量说明](https://emotiv.gitbook.io/emotivpro-v3/emotivpro-menu/contact-quality-map/contact-quality-cq-vs.-eeg-quality-eq)

`dev` 与 `eq` 的文档推送频率为 2 Hz，不能要求它们与每条 128/256 Hz EEG 样本同步出现；旧质量值需要附接收时刻与过期状态。[Cortex Data Subscription](https://emotiv.gitbook.io/cortex-api/data-subscription) EEG 波形的通道区分色不能作为质量颜色解释。

## 设备桥数据契约

本节对应 `src/neuro-signal-store.js`。原始包单独保存，面板使用独立的显示表示。`source` 是桥声明的来源名称，不是硬件身份认证证明。缺少通道或单位的旧 EEG 包可保留为 `unmapped` / `unknown-units`，不能据此生成 14 条已校准曲线。

| 包类型 | 关键字段 |
| --- | --- |
| `eeg` | `channels`：1–14 个不重复的上述名称；`samples`：一条通道向量或 sample-major 二维数组，每行与 channels 等长，缺失为 `null`；`sampleRateHz`：128/256；`units`：`uV`、`mV` 或 `V` |
| `quality` | `stream:'eeg'`；`contactQuality` 与 `eegQuality` 按通道名给值；分别声明 `cqScale` / `eqScale`，支持 `emotiv-cq-0-4` / `emotiv-eq-0-4`，或显式 `{min,max,label}`。也支持每项 `{values,scale}`；`eegQuality` 内可附 `overall/sampleRateQuality`，或在 `type:quality, stream:eeg` 包顶层提供，均原值保留 |
| `device` / `status` | `stream:'eeg'|'gaze'|'all'`；`connected:true|false|null`；可带 `deviceId`、`reason`。连接与收到信号、信号质量是不同状态 |
| `gaze` | `x/y`、`valid`、`coordinateSystem`；可选 `leftEye/rightEye` 各自的 `valid,x,y,pupilDiameter,pupilUnit,quality`；无效追踪允许没有坐标 |

`uV` 在画面标为 `µV`；已声明 mV/V 的数值可换算用于显示，保存包不变。Cortex 输出通道值本身以微伏给出，其 `INTERPOLATED` 标记应由桥保留：所谓 raw 流也可能包含 Cortex 补出的样本，本页面不再次插值。[Cortex 数据字段](https://emotiv.gitbook.io/cortex-api/data-subscription/data-sample-object)

每个包可附 `timestamp` 原值、`timestampUnit` 和 `clockDomain`。Cortex 的 `time` 为 Unix UTC 秒；不能与浏览器接收时间的毫秒混用。设备型号、固件、配置、原 `cols`、插值/计数及总体质量字段可作为附加元数据保留，未展示不等于不存在。

显示表示还保留 `gaze.validityDeclared`，区分设备明确提供 `valid` 与旧包默认兼容。眼动 `quality` 如果是旧协议对象，原内容保存在 `qualityMetadata`，不冒充数值质量。

格式示例中的数值只是测试数据，非生理测量：

```js
{
  type: 'eeg',
  source: 'TEST_INJECTED_NOT_DEVICE_MEASURED',
  provenance: 'TEST_INJECTED_NOT_DEVICE_MEASURED',
  timestamp: 1788782400.125,
  timestampUnit: 's',
  clockDomain: 'unix-utc',
  channels: ['AF3','F7','F3','FC5','T7','P7','O1','O2','P8','T8','FC6','F4','F8','AF4'],
  samples: [1,2,3,4,5,6,7,8,9,10,11,12,13,14],
  sampleRateHz: 128,
  units: 'uV'
}
```

测试来源常量为 `TEST_INJECTED_NOT_DEVICE_MEASURED`；测试包和对应回放必须保留此标记。不得把测试注入、软件虚拟设备或录制回放显示成实时硬件测量。

## 时间、暂停与回放

v11 采集 metadata 明确记录 `replayClock:'capture-wall-time'`。帧、信号与事件按 `_capture.elapsedMs` 共用采集经过时间轴；`simTime` 单独保留。打开资料库或暂停人物后，场景时间可以停住，设备信号仍随采集时间继续保存和回放。

优先顺序为 `_capture.elapsedMs`，其后是明确的 `recordedAt` / 接收时刻；无法使用这些字段的旧数据才退回场景时间。旧 v10 保持其 `simTime` 回放兼容路径，并标明 fallback。只有场景时间的历史信号不能恢复暂停期间的真实采样间隔。

本面板实时横轴当前采用桥包的接收时间。EEG 批次在声明了采样率时，以末样本接收时刻为锚点，按标称间隔向前展开；这是显示排布，不是设备时钟同步测量。原设备时间、浏览器接收时间（毫秒）与场景时间（秒）分别保留。局域网到达延迟、浏览器调度延迟与批量发送均可能影响显示位置，不能据此声称毫秒级 EEG–眼动硬件同步。未声明采样率的批次不猜测内部时间间隔。显示行用 `timeBasis:receipt-expanded-at-nominal-rate` 或 `receipt-only` 记录这一差别；源 `INTERPOLATED` / `interpolated` 保留在显示行的 `interpolated` 字段中。

每次开始新的采集会清除上一段实时波形、标记和计数，保留设备声明状态。质量有独立的原接收时刻、`ageMs` 与 `stale`，切换采集不会把旧质量刷新成新值。

回放只显示游标时刻已经发生的信号、事件与眼动轨迹。向后拖动不能保留未来样本；播放暂停不能继续制造新运动或生理数据。事件标记只来自实际记录的事件；`appendEvent` 只添加显示标记，不触发人物控制。

## 独立眼动与专家视野

Cortex `fac` 流提供面部/眼部动作类别，而不是校准后的屏幕注视坐标、双眼瞳孔或完整眼动仪采样。本页面的 gaze 来自独立眼动设备/桥。[Cortex 面部动作字段](https://emotiv.gitbook.io/cortex-api/data-subscription/data-sample-object)

`viewport-normalized` 表示当前完整 3D viewport 左上角为 `(0,0)`、右下角为 `(1,1)`。校准桥必须考虑屏幕、浏览器面板、全屏/缩放和有效成像矩形。第一人称固定水平/垂直视野可能产生视野外遮罩；遮罩外的点不能作为场景目标命中。

`screen-normalized` 或声明屏幕尺寸的 `screen-pixels` 可以在独立眼动图中显示，但不意味着已经校准到 3D viewport。全屏屏幕坐标不能直接用于人物选取。左右眼有效性、瞳孔大小和单位只在桥提供时展示；缺失不是零瞳孔或闭眼。旧包缺少 `coordinateSystem` / `valid` 的默认行为仅为兼容旧协议，不代表设备校准或质量声明。

## 验证边界

本轮验证只覆盖明确测试来源的包格式、通道映射、单位处理、缺失数据、过期/断开状态、显示与采集回放时间线。没有连接真实 EMOTIV 或眼动硬件，因此不声称验证了电极接触、实际采样率、Cortex 授权、设备时钟同步、眼动校准精度或现场噪声表现。面板用于记录和观察，不输出医学结论或自行推断情绪。

主工作区将完整采集时长作为`loadReplay(records,{durationMs})`的边界传入；无信号尾段仍继续推进采集游标并正确显示过期。设备桥的连接/断开记录为独立的`mindspace-device-bridge`来源状态，其`connectionScope:transport`明确区分传输层状态与硬件测量。
