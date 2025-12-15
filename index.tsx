import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import { 
  Copy, 
  FileText, 
  CheckCircle, 
  Info, 
  Search, 
  AlertTriangle, 
  Trash2, 
  DollarSign, 
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Upload,
  Image as ImageIcon,
  Calendar,
  MessageCircle,
  Send,
  Smile,
  Video,
  Paperclip,
  User,
  ListFilter,
  SlidersHorizontal,
  Activity,
  Zap,
  LayoutDashboard,
  Wallet,
  ClipboardList,
  Megaphone,
  Bell,
  Check,
  Users,
  Settings,
  MapPin,
  Clock,
  Tag,
  Eye,
  Phone,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// --- 类型定义 ---

enum OrderStatus {
  PendingDispatch = '待派单',
  Completed = '已完成',
  Void = '作废',
  Returned = '已退回',
  Error = '报错'
}

interface Order {
  id: number;
  orderNo: string;
  workOrderNo: string;
  dispatchTime: string;
  mobile: string;
  serviceItem: string;
  serviceRatio: '3:7' | '2:8' | '4:6'; 
  status: OrderStatus;
  returnReason?: string; 
  errorDetail?: string; 
  region: string;
  address: string;
  details: string;
  recordTime: string;
  source: string;
  totalAmount: number;
  cost: number;
  hasAdvancePayment: boolean; 
  depositAmount?: number;
  weightedCoefficient: number;
  regionPeople: number;
  isReminded: boolean;
  suggestedMethod: string; // 建议方式
  guidePrice: number;      // 划线价
  historicalPrice: string; // 历史价 (改为字符串区间)

  // --- 新增字段 ---
  hasCoupon: boolean;      // 是否有券
  isCouponVerified: boolean; // 是否验券
  isRead: boolean;         // 是否已读
  isCalled: boolean;       // 是否拨打
  warrantyPeriod: string;  // 质保期
  workPhone: string;       // 工作机
  customerName: string;    // 客户姓名
  dispatcherName: string;  // 派单员
  recorderName: string;    // 录单员
  masterName: string;      // 师傅
  masterPhone: string;     // 师傅手机号 (新增)
  totalReceipt: number;    // 总收款
  // cost 已存在
  revenue: number;         // 业绩
  actualPaid: number;      // 实付金额
  advancePaymentAmount: number; // 垫付金额
  otherReceipt: number;    // 其他收款
  completionIncome: number; // 完工收入
  completionTime: string;  // 完成时间
  paymentTime: string;     // 收款时间
  serviceTime: string;     // 服务时间
  voiderNameAndReason: string; // 作废人/作废原因
  voidDetails: string;     // 作废详情
  cancelReasonAndDetails: string; // 取消原因/取消详情
  favoriteRemark: string;  // 收藏备注
}

// --- 辅助函数 ---
const formatCurrency = (amount: number) => {
  return Number.isInteger(amount) ? amount.toString() : amount.toFixed(1);
};

const formatDate = (date: Date) => {
  return `${date.getMonth() + 1}-${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// --- Mock 数据生成 ---
const generateMockData = (): Order[] => {
  const services = ['家庭保洁日常', '深度家电清洗', '甲醛治理', '玻璃清洗', '管道疏通', '空调清洗', '开荒保洁', '收纳整理', '沙发清洗'];
  const regions = ['北京市/朝阳区', '上海市/浦东新区', '深圳市/南山区', '杭州市/西湖区', '成都市/武侯区', '广州市/天河区', '武汉市/江汉区', '南京市/鼓楼区'];
  const sources = ['小程序', '电话', '美团', '转介绍', '抖音', '58同城'];
  const coefficients = [1.0, 1.1, 1.2, 1.3, 1.5];
  const methods = ['系统派单', '人工指派', '抢单模式', '指定师傅'];
  const warranties = ['30天', '3个月', '6个月', '无', '1年'];
  const names = ['张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十'];
  const masters = ['王师傅', '李师傅', '张师傅', '刘师傅', '陈师傅'];
  const dispatchers = ['客服A', '客服B', '客服C', '系统自动'];
  
  let pendingCount = 0;

  return Array.from({ length: 128 }).map((_, i) => {
    const id = i + 1;
    let status = OrderStatus.Completed;
    let returnReason = undefined;
    let errorDetail = undefined;

    if (pendingCount < 10 && i % 10 === 0) { 
      status = OrderStatus.PendingDispatch;
      pendingCount++;
    } else if (i % 15 === 1) {
      status = OrderStatus.Void;
    } else if (i % 15 === 2) {
      status = OrderStatus.Returned;
      returnReason = '客户改期/联系不上';
    } else if (i % 15 === 3) {
      status = OrderStatus.Error;
      errorDetail = '现场与描述不符，需加价';
    } else {
      status = OrderStatus.Completed;
    }

    const baseAddress = `${['阳光', '幸福', '金地', '万科', '恒大'][i % 5]}花园 ${i % 20 + 1}栋 ${i % 30 + 1}0${i % 4 + 1}室`;
    const extraInfo = `(需联系物业核实车位情况)`;
    const baseDetails = ['需带梯子，层高3.5米，有大型犬', '有宠物，需要发票，客户要求穿鞋套', '尽量上午，客户下午要出门', '需带吸尘器，重点清理地毯', '刚装修完，灰尘较大'][i % 5];
    
    const amount = 150 + (i % 20) * 20;
    const cost = amount * (i % 2 === 0 ? 0.6 : 0.7);

    // Random dates
    const now = new Date();
    const dispatchDate = new Date(now.getTime() - Math.random() * 86400000 * 3);
    const completeDate = new Date(dispatchDate.getTime() + Math.random() * 7200000 + 3600000);
    const paymentDate = new Date(completeDate.getTime() + Math.random() * 60000);
    
    // Create historical price range
    const minPrice = Math.floor(amount * 0.8);
    const maxPrice = Math.floor(amount * 1.2);

    return {
      id,
      orderNo: `ORD-20231027-${String(id).padStart(4, '0')}`,
      workOrderNo: `WO-${9980 + id}`,
      dispatchTime: formatDate(dispatchDate),
      mobile: `13${i % 9 + 1}****${String(1000 + i).slice(-4)}`,
      serviceItem: services[i % services.length],
      serviceRatio: (['3:7', '4:6', '2:8'][i % 3]) as any,
      status,
      returnReason,
      errorDetail,
      region: regions[i % regions.length],
      address: baseAddress, 
      details: `${baseDetails} ${extraInfo}`,
      recordTime: formatDate(new Date(dispatchDate.getTime() - 3600000)),
      source: sources[i % sources.length],
      totalAmount: amount,
      cost: cost,
      hasAdvancePayment: i % 7 === 0,
      depositAmount: i % 12 === 0 ? 50 : undefined,
      weightedCoefficient: coefficients[i % coefficients.length],
      regionPeople: Math.floor(Math.random() * 6),
      isReminded: false,
      suggestedMethod: methods[i % methods.length],
      guidePrice: amount * 1.2,
      historicalPrice: `${minPrice}-${maxPrice}`,

      // 新增字段 Mock
      hasCoupon: Math.random() > 0.7,
      isCouponVerified: Math.random() > 0.8,
      isRead: Math.random() > 0.2,
      isCalled: Math.random() > 0.1,
      warrantyPeriod: warranties[i % warranties.length],
      workPhone: `15${i % 9 + 1}****${String(2000 + i).slice(-4)}`,
      customerName: names[i % names.length],
      dispatcherName: dispatchers[i % dispatchers.length],
      recorderName: dispatchers[(i + 1) % dispatchers.length],
      masterName: masters[i % masters.length],
      masterPhone: `18${i % 9}****${String(6600 + i).slice(-4)}`, // 新增师傅手机
      totalReceipt: amount,
      revenue: amount - cost,
      actualPaid: amount * 0.9,
      advancePaymentAmount: i % 7 === 0 ? 30 : 0,
      otherReceipt: i % 20 === 0 ? 20 : 0,
      completionIncome: amount - cost - 10,
      completionTime: status === OrderStatus.Completed ? formatDate(completeDate) : '',
      paymentTime: status === OrderStatus.Completed ? formatDate(paymentDate) : '',
      serviceTime: formatDate(new Date(dispatchDate.getTime() + 1800000)),
      voiderNameAndReason: status === OrderStatus.Void ? `操作员${i%3} / 客户取消` : '',
      voidDetails: status === OrderStatus.Void ? '客户表示暂时不需要服务了' : '',
      cancelReasonAndDetails: '',
      favoriteRemark: i % 10 === 0 ? '优质客户，下次优先' : '',
    };
  });
};

const FULL_MOCK_DATA = generateMockData();

// --- 组件定义 ---

const NotificationBar = () => {
  return (
    <div className="mb-3 bg-orange-50 border border-orange-100 rounded-lg px-4 py-2 flex items-center gap-3 overflow-hidden relative">
      <div className="flex items-center gap-1.5 text-orange-600 font-bold whitespace-nowrap z-10 bg-orange-50 pr-2">
        <Megaphone size={16} className="animate-pulse" />
        <span className="text-xs">通知公告</span>
      </div>
      <div className="flex-1 overflow-hidden relative h-5 group">
        <div className="absolute whitespace-nowrap animate-marquee group-hover:pause-animation text-xs text-orange-800 flex items-center">
          <span className="mr-8">📢 系统升级通知：今晚 24:00 将进行系统维护，预计耗时 30 分钟。</span>
          <span className="mr-8">🔥 10月业绩pk赛圆满结束，恭喜华东大区获得冠军！</span>
          <span className="mr-8">⚠️ 请各位接单员注意：近期客户反馈电话未接通率较高，请保持电话畅通。</span>
          <span>💡 新功能上线：现已支持批量导出财务报表，欢迎试用。</span>
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .group-hover\\:pause-animation:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

// 新增：数据概览组件 (包含高级筛选按钮)
const DataOverview = ({ isSearchOpen, onToggleSearch }: { isSearchOpen: boolean; onToggleSearch: () => void }) => {
  return (
    <div className="mb-3 bg-[#F0F7FF] border border-blue-100 rounded-lg px-4 py-3 flex items-center justify-between shadow-sm">
       <div className="flex items-center gap-6 overflow-x-auto no-scrollbar flex-1 mr-4">
          <div className="flex items-center gap-2 pr-6 border-r border-blue-200 shrink-0">
             <Activity className="text-blue-600" size={20} />
             <span className="font-bold text-slate-800 text-sm">数据概览</span>
          </div>
          <div className="flex items-center gap-8 text-xs whitespace-nowrap">
             <div className="flex items-baseline gap-1.5"><span className="text-slate-500">录单数</span><span className="text-lg font-bold text-slate-800">156</span></div>
             <div className="flex items-baseline gap-1.5"><span className="text-slate-500">报错数</span><span className="text-lg font-bold text-red-500">12</span></div>
             <div className="flex items-baseline gap-1.5"><span className="text-slate-500">当月总录单数</span><span className="text-lg font-bold text-blue-600">3,420</span></div>
             <div className="flex items-baseline gap-1.5"><span className="text-slate-500">当月转化率</span><span className="text-lg font-bold text-green-600">68.5%</span></div>
             <div className="flex items-baseline gap-1.5"><span className="text-slate-500">当月目标录单数</span><span className="text-lg font-bold text-slate-800">5,000</span></div>
             <div className="flex items-baseline gap-1.5"><span className="text-slate-500">当月目标转化率</span><span className="text-lg font-bold text-slate-800">70%</span></div>
             <div className="flex items-baseline gap-1.5"><span className="text-slate-500">当月目标咨询数差值</span><span className="text-lg font-bold text-orange-600">-128</span></div>
          </div>
       </div>
       
       <button 
          onClick={onToggleSearch}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-blue-50 text-blue-600 transition-colors text-sm font-medium shrink-0"
        >
            <Search size={16} />
            <span>点这高级筛选</span>
            {isSearchOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
    </div>
  )
}

// 优化：ActionBar (移除了高级筛选按钮，因为移到了 DataOverview)
const ActionBar = ({ onRecord }: { onRecord: () => void }) => {
  return (
    <div className="flex items-center gap-6 mb-3 px-1">
      <div className="flex items-center gap-3">
        <button 
          onClick={onRecord}
          className="h-8 px-5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded shadow-md shadow-blue-200 flex items-center gap-1.5 transition-all active:scale-95 font-medium"
        >
          <Plus size={14} /> 录单
        </button>
        <button className="h-8 px-5 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs rounded shadow-md shadow-indigo-200 flex items-center gap-1.5 transition-all active:scale-95 font-medium">
          <Zap size={14} /> 快找
        </button>
      </div>
      
      <div className="h-5 w-px bg-slate-300"></div>
      
      <div className="flex items-center gap-6 text-xs text-slate-600 font-medium flex-1">
        <button className="hover:text-blue-600 transition-colors hover:bg-white hover:shadow-sm px-2 py-1 rounded">批量完成</button>
        <button className="hover:text-blue-600 transition-colors hover:bg-white hover:shadow-sm px-2 py-1 rounded">批量作废</button>
        <button className="hover:text-blue-600 transition-colors hover:bg-white hover:shadow-sm px-2 py-1 rounded">存疑号码</button>
        <button className="hover:text-blue-600 transition-colors hover:bg-white hover:shadow-sm px-2 py-1 rounded">黑名单</button>
      </div>
    </div>
  );
};

// --- 重构：SearchPanel (纯筛选区，9列布局，无顶部条) ---
const SearchPanel = ({ isOpen }: { isOpen: boolean; onToggle?: () => void }) => {
  const [timeType, setTimeType] = useState('create');

  if (!isOpen) return null;

  return (
    <div className="shadow-sm mb-3 transition-all duration-300 ease-out relative rounded-lg border border-blue-200 bg-[#F0F7FF] px-5 py-4 animate-in fade-in slide-in-from-top-2">
       <div className="flex flex-col gap-3">
          
          {/* Grid Layout: 9 Columns */}
          <div className="grid grid-cols-9 gap-3">
              {/* --- ROW 1 (9 inputs) --- */}
              
              {/* 1. Order/Mobile/Customer */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">关键词</label>
                  <input type="text" className="h-8 w-full px-2 border border-blue-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white placeholder-slate-300" placeholder="订单号/手机/客户..." />
              </div>
              {/* 2. Extension */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">分机</label>
                  <input type="text" className="h-8 w-full px-2 border border-blue-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white placeholder-slate-300" placeholder="请输入..." />
              </div>
              {/* 3. Creator */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">创建人</label>
                  <input type="text" className="h-8 w-full px-2 border border-blue-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white placeholder-slate-300" placeholder="请输入..." />
              </div>
              {/* 4. Service Item */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">项目</label>
                  <input type="text" className="h-8 w-full px-2 border border-blue-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white placeholder-slate-300" placeholder="服务项目..." />
              </div>
              {/* 5. Region */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">地域</label>
                  <input type="text" className="h-8 w-full px-2 border border-blue-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white placeholder-slate-300" placeholder="请输入..." />
              </div>
              {/* 6. Status */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">状态</label>
                  <select className="h-8 w-full px-2 border border-blue-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white">
                    <option value="">全部</option><option value="PendingDispatch">待派单</option><option value="Completed">已完成</option>
                  </select>
              </div>
              {/* 7. Source */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">来源</label>
                  <select className="h-8 w-full px-2 border border-blue-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white">
                    <option value="">全部</option><option value="app">小程序</option><option value="phone">电话</option>
                  </select>
              </div>
               {/* 8. Dispatch Method */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">方式</label>
                  <select className="h-8 w-full px-2 border border-blue-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white">
                    <option value="">全部</option><option value="auto">系统</option><option value="manual">人工</option>
                  </select>
              </div>
               {/* 9. Is Replenishment */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">补款</label>
                  <select className="h-8 w-full px-2 border border-blue-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white">
                    <option value="">全部</option><option value="yes">是</option><option value="no">否</option>
                  </select>
              </div>

              {/* --- ROW 2 (Remaining 5 inputs + Time(3) + Buttons(1)) = 9 cols --- */}

              {/* 10. Work Phone */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">工作机</label>
                  <input type="text" className="h-8 w-full px-2 border border-blue-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white placeholder-slate-300" placeholder="请输入..." />
              </div>
              {/* 11. Dispatcher */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">派单员</label>
                  <input type="text" className="h-8 w-full px-2 border border-blue-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white placeholder-slate-300" placeholder="请输入..." />
              </div>
              {/* 12. Master */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">师傅</label>
                  <input type="text" className="h-8 w-full px-2 border border-blue-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white placeholder-slate-300" placeholder="请输入..." />
              </div>
              {/* 13. Offline Master Phone */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-[11px] text-slate-500 min-w-[44px] text-right leading-none">线下师傅<br/>手机</label>
                  <input type="text" className="h-8 w-full px-2 border border-blue-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white placeholder-slate-300" placeholder="请输入..." />
              </div>
              {/* 14. Cost Ratio */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">比例</label>
                  <input type="text" className="h-8 w-full px-2 border border-blue-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white placeholder-slate-300" placeholder="请输入..." />
              </div>

              {/* 15. Time Filter (Span 3 Cols) */}
              <div className="col-span-3 flex items-center gap-2">
                  <div className="relative shrink-0">
                    <select 
                      value={timeType}
                      onChange={(e) => setTimeType(e.target.value)}
                      className="h-8 pl-2 pr-6 border border-blue-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white font-medium text-slate-700 appearance-none cursor-pointer w-[80px]"
                    >
                      <option value="create">创建时间</option>
                      <option value="finish">完成时间</option>
                      <option value="payment">收款时间</option>
                      <option value="service">服务时间</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-2.5 text-slate-400 pointer-events-none"/>
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-blue-200 rounded px-2 h-8 flex-1">
                     <Calendar size={14} className="text-slate-400" />
                     <input type="datetime-local" className="bg-transparent text-xs text-slate-600 outline-none flex-1 min-w-0" />
                     <span className="text-slate-300">-</span>
                     <input type="datetime-local" className="bg-transparent text-xs text-slate-600 outline-none flex-1 min-w-0" />
                  </div>
              </div>

              {/* 16. Buttons (Span 1 Col - Right Aligned) */}
              <div className="col-span-1 flex items-center gap-2 justify-end">
                  <button className="h-8 px-3 bg-white text-slate-600 hover:text-blue-600 text-xs rounded transition-colors border border-slate-200 hover:border-blue-400 shadow-sm font-medium w-full">
                      重置
                  </button>
                  <button className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-all font-bold shadow-md flex items-center justify-center gap-1 active:scale-95 w-full">
                      <Search size={12} /> 搜索
                  </button>
              </div>

          </div>
       </div>
    </div>
  );
};

// --- Missing Components Definitions ---

const ServiceItemCell = ({ item, warranty }: { item: string, warranty: string }) => (
  <div className="flex flex-col">
    <span className="text-[13px] font-medium text-slate-700 truncate max-w-[130px]" title={item}>{item}</span>
    {warranty && warranty !== '无' && (
      <span className="text-[11px] text-green-600 bg-green-50 px-1.5 rounded w-fit mt-0.5 border border-green-100">
        质保: {warranty}
      </span>
    )}
  </div>
);

const StatusCell = ({ order }: { order: Order }) => {
  const statusColors = {
    [OrderStatus.PendingDispatch]: 'bg-orange-100 text-orange-700 border-orange-200',
    [OrderStatus.Completed]: 'bg-green-100 text-green-700 border-green-200',
    [OrderStatus.Void]: 'bg-slate-100 text-slate-500 border-slate-200',
    [OrderStatus.Returned]: 'bg-red-100 text-red-700 border-red-200',
    [OrderStatus.Error]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };
  return (
    <div className="flex flex-col gap-1">
       <span className={`px-2 py-0.5 rounded text-[11px] font-bold border w-fit whitespace-nowrap ${statusColors[order.status]}`}>
         {order.status}
       </span>
       {order.returnReason && <span className="text-[10px] text-red-500 leading-tight">{order.returnReason}</span>}
       {order.errorDetail && <span className="text-[10px] text-yellow-600 leading-tight">{order.errorDetail}</span>}
    </div>
  );
};

const TooltipCell = ({ content, maxWidthClass, showTooltip }: { content: string, maxWidthClass: string, showTooltip: boolean }) => (
  <div className="relative group">
    <div className={`text-[12px] text-slate-600 truncate cursor-help ${maxWidthClass}`}>
      {content}
    </div>
     {showTooltip && (
      <div className="absolute left-0 bottom-full mb-1 w-max max-w-[200px] bg-slate-800 text-white text-xs p-2 rounded shadow-lg z-50 whitespace-normal pointer-events-none">
        {content}
        <div className="absolute left-4 top-full w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-800"></div>
      </div>
    )}
  </div>
);

const CombinedIdCell = ({ orderNo, workOrderNo, hasAdvancePayment, depositAmount }: { orderNo: string, workOrderNo: string, hasAdvancePayment: boolean, depositAmount?: number }) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-1">
      <span className="text-[12px] font-mono text-slate-600">{orderNo}</span>
      <button className="text-slate-400 hover:text-blue-500"><Copy size={10} /></button>
    </div>
    <div className="flex items-center gap-1">
      <span className="text-[11px] font-mono text-slate-400">{workOrderNo}</span>
    </div>
    <div className="flex gap-1 mt-0.5">
       {hasAdvancePayment && <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1 rounded border border-indigo-100">垫</span>}
       {depositAmount && <span className="text-[9px] bg-pink-50 text-pink-600 px-1 rounded border border-pink-100">定¥{depositAmount}</span>}
    </div>
  </div>
);

const CombinedTimeCell = ({ recordTime, dispatchTime }: { recordTime: string, dispatchTime: string }) => (
   <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1 text-[11px] text-slate-500" title="录单时间">
         <Clock size={10} className="shrink-0" />
         <span className="whitespace-nowrap">{recordTime.split(' ')[0]}</span>
      </div>
      <div className="flex items-center gap-1 text-[11px] text-blue-600 font-medium" title="上门时间">
         <MapPin size={10} className="shrink-0" />
         <span className="whitespace-nowrap">{dispatchTime}</span>
      </div>
   </div>
);

const ReminderCell = ({ order, onRemind }: { order: Order, onRemind: (id: number) => void }) => {
  return (
    <div className="flex justify-center items-center gap-1">
       <button 
          onClick={() => onRemind(order.id)}
          disabled={order.isReminded}
          className={`
            w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300
            ${order.isReminded 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white hover:shadow-md hover:scale-110'
            }
          `}
          title={order.isReminded ? "已催单" : "点击催单"}
       >
         {order.isReminded ? <Check size={14} /> : <Bell size={14} className={order.isReminded ? '' : 'animate-pulse_slow'} />}
       </button>
       <span className="text-[12px] text-slate-600">催单</span>
    </div>
  )
};

const ActionCell = ({ orderId, onAction }: { orderId: number, onAction: (action: string, id: number) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleScroll = () => { if(isOpen) setIsOpen(false); };
    window.addEventListener('scroll', handleScroll, true); 
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    }
  }, [isOpen]);

  const toggleMenu = () => {
      if (!isOpen && buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          setMenuPosition({ 
            top: rect.top, 
            left: rect.left - 120 
          });
      }
      setIsOpen(!isOpen);
  };

  return (
    <>
      <button 
        ref={buttonRef}
        onClick={toggleMenu}
        className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-full transition-colors"
      >
        <ListFilter size={16} />
      </button>
      
      {isOpen && createPortal(
        <>
           <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)}></div>
           <div 
             className="fixed z-[9999] w-28 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200"
             style={{ 
               top: menuPosition.top, 
               left: menuPosition.left 
             }}
           >
              <button onClick={() => { onAction('详情', orderId); setIsOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"><FileText size={14}/> 详情</button>
              <button onClick={() => { onAction('添加报错', orderId); setIsOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2"><AlertTriangle size={14}/> 添加报错</button>
              <button onClick={() => { onAction('其他收款', orderId); setIsOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-green-50 hover:text-green-600 flex items-center gap-2"><DollarSign size={14}/> 其他收款</button>
           </div>
        </>,
        document.body
      )}
    </>
  );
};

const Pagination = ({ total, current, pageSize, onPageChange, onSizeChange }: { total: number, current: number, pageSize: number, onPageChange: (p: number) => void, onSizeChange: (s: number) => void }) => {
  const totalPages = Math.ceil(total / pageSize);
  
  return (
    <div className="flex items-center justify-center gap-4 text-xs text-slate-600 select-none">
       <span className="text-slate-400">共 {total} 条</span>
       
       <div className="flex items-center gap-2">
         <button 
           onClick={() => onPageChange(Math.max(1, current - 1))}
           disabled={current === 1}
           className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:bg-white hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed bg-slate-50 transition-colors"
         >
           <ChevronLeft size={14} />
         </button>
         
         <div className="flex items-center gap-1">
            <span className="font-medium text-slate-900">{current}</span>
            <span className="text-slate-400">/</span>
            <span>{totalPages}</span>
         </div>

         <button 
           onClick={() => onPageChange(Math.min(totalPages, current + 1))}
           disabled={current === totalPages}
           className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:bg-white hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed bg-slate-50 transition-colors"
         >
           <ChevronRight size={14} />
         </button>
       </div>

       <select 
         value={pageSize}
         onChange={(e) => { onSizeChange(Number(e.target.value)); onPageChange(1); }}
         className="h-8 border border-gray-200 rounded px-2 bg-slate-50 outline-none focus:border-blue-500 cursor-pointer"
       >
         <option value={20}>20条/页</option>
         <option value={50}>50条/页</option>
         <option value={100}>100条/页</option>
       </select>
       
       <div className="flex items-center gap-2">
         <span>跳至</span>
         <input 
           type="number" 
           className="w-12 h-8 border border-gray-200 rounded px-2 text-center outline-none focus:border-blue-500 bg-slate-50"
           onKeyDown={(e) => {
             if (e.key === 'Enter') {
               const val = parseInt((e.target as HTMLInputElement).value);
               if (val >= 1 && val <= totalPages) onPageChange(val);
             }
           }}
         />
         <span>页</span>
       </div>
    </div>
  );
};

const RecordOrderModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
         <div className="flex items-center justify-between p-4 border-b">
           <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
             <Plus className="text-blue-600" size={20} />
             录入新订单
           </h3>
           <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
         </div>
         <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">客户手机</label>
                 <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="输入手机号自动匹配" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">服务项目</label>
                 <select className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option>家庭保洁日常</option>
                    <option>深度家电清洗</option>
                 </select>
               </div>
            </div>
            {/* More form fields mock */}
            <div className="p-4 bg-blue-50 text-blue-800 rounded text-sm text-center">
               此处为表单录入区域（Mock）
            </div>
         </div>
         <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded transition-colors">取消</button>
            <button onClick={onClose} className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 shadow-md transition-colors">确认录入</button>
         </div>
      </div>
    </div>,
    document.body
  );
};

const CompleteOrderModal = ({ isOpen, onClose, order }: { isOpen: boolean, onClose: () => void, order: Order | null }) => {
  if (!isOpen || !order) return null;
  return createPortal(
     <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-[500px] animate-in zoom-in-95 duration-200">
         <div className="flex items-center justify-between p-4 border-b">
           <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
             <CheckCircle className="text-green-600" size={20} />
             完单确认
           </h3>
           <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
         </div>
         <div className="p-6">
            <p className="text-slate-600 mb-4">确认将订单 <span className="font-mono font-bold text-slate-900">{order.orderNo}</span> 标记为完成？</p>
            
            <div className="bg-slate-50 p-3 rounded mb-4 text-sm space-y-2">
               <div className="flex justify-between"><span>服务金额:</span> <span className="font-bold">¥{order.totalAmount}</span></div>
               <div className="flex justify-between"><span>实际收款:</span> <span className="font-bold text-green-600">¥{order.actualPaid}</span></div>
            </div>

            <div className="flex items-start gap-2 text-orange-600 text-xs bg-orange-50 p-2 rounded">
               <AlertTriangle size={14} className="shrink-0 mt-0.5" />
               <p>完单后将触发自动分账，并向客户发送服务评价短信。</p>
            </div>
         </div>
         <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded transition-colors">取消</button>
            <button onClick={onClose} className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 shadow-md transition-colors">确认完单</button>
         </div>
      </div>
    </div>,
    document.body
  );
};

const ChatModal = ({ isOpen, onClose, role, order }: { isOpen: boolean, onClose: () => void, role: string, order: Order | null }) => {
   if (!isOpen || !order) return null;
   return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-white rounded-xl shadow-2xl w-[800px] h-[600px] flex flex-col animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between p-4 border-b bg-slate-50 rounded-t-xl">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                   <User size={20} />
                </div>
                <div>
                   <h3 className="font-bold text-slate-800">与 {role} 的对话</h3>
                   <p className="text-xs text-slate-500">订单: {order.orderNo}</p>
                </div>
             </div>
             <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
          </div>
          <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
             <div className="flex justify-center"><span className="text-xs text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">今天 10:23</span></div>
             
             {/* Mock messages */}
             <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 text-xs font-bold">{role[0]}</div>
                <div className="bg-white p-3 rounded-tr-xl rounded-b-xl shadow-sm text-sm text-slate-700 max-w-[70%]">
                   您好，关于这个订单的特殊需求我已经备注了，请注意查看。
                </div>
             </div>

             <div className="flex gap-3 flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 text-xs font-bold">我</div>
                <div className="bg-blue-600 text-white p-3 rounded-tl-xl rounded-b-xl shadow-sm text-sm max-w-[70%]">
                   好的，收到。我会重点跟进的。
                </div>
             </div>
          </div>
          <div className="p-4 border-t bg-white rounded-b-xl">
             <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><Paperclip size={20} /></button>
                <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><ImageIcon size={20} /></button>
                <input type="text" className="flex-1 bg-slate-100 border-0 rounded-full px-4 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="输入消息..." />
                <button className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 shadow-md transition-colors"><Send size={18} className="ml-0.5" /></button>
             </div>
          </div>
       </div>
    </div>,
    document.body
   );
}

const App = () => {
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false); 
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>(FULL_MOCK_DATA);

  const handleRemindOrder = (id: number) => {
     setOrders(prevOrders => prevOrders.map(order => 
        order.id === id ? { ...order, isReminded: true } : order
     ));
  };
  
  const sortedData = [...orders].sort((a, b) => {
    const aIsPending = a.status === OrderStatus.PendingDispatch;
    const bIsPending = b.status === OrderStatus.PendingDispatch;
    if (aIsPending && !bIsPending) return -1;
    if (!aIsPending && bIsPending) return 1;
    if (a.isReminded !== b.isReminded) return a.isReminded ? 1 : -1;
    return 0;
  });

  const totalItems = sortedData.length;
  const currentData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const [chatState, setChatState] = useState<{isOpen: boolean; role: string; order: Order | null;}>({ isOpen: false, role: '', order: null });
  const [hoveredTooltipCell, setHoveredTooltipCell] = useState<{rowId: number, colKey: 'address' | 'details' | 'service'} | null>(null);

  const handleAction = (action: string, id: number) => {
    const order = sortedData.find(o => o.id === id);
    if (!order) return;
    if (action === '完单') { setCurrentOrder(order); setCompleteModalOpen(true); } 
    else { alert(`已执行操作：${action} (订单ID: ${id})`); }
  };

  const handleOpenChat = (role: string, order: Order) => { setChatState({ isOpen: true, role, order }); };
  const handleMouseEnterOther = () => { setHoveredTooltipCell(null); };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-200 to-slate-300 p-6 flex flex-col overflow-hidden">
      <style>{`
        /* 
         * 核心优化：强制覆盖表格层级和背景，解决右侧固定列穿插问题
         * 使用 !important 确保样式优先级最高，不受 Tailwind 类名影响
         */

        /* 1. 全局单元格层级重置：让所有普通单元格层级最低 */
        td, th {
          z-index: 1;
          position: relative;
        }

        /* 2. 右侧固定列：最高层级，压住所有内容 */
        .sticky-col {
          position: sticky !important;
          z-index: 100 !important; /* 远高于普通单元格 */
          background-clip: padding-box;
        }
        
        /* 表头固定列：需要比表体固定列更高，防止表体内容滚上来盖住表头 */
        thead th.sticky-col {
          z-index: 110 !important;
        }
        
        /* 普通表头：也需要比普通内容高 */
        thead th:not(.sticky-col) {
          z-index: 50; 
        }

        /* --- 3. 背景色 (必须100%不透明) --- */
        
        /* 表头背景 */
        th.sticky-th-solid {
          background-color: #f8fafc !important; /* slate-50 */
        }

        /* 表体背景 - 默认（奇数行） */
        tr td.sticky-bg-solid {
          background-color: #ffffff !important;
        }
        
        /* 表体背景 - 偶数行 (Tailwind blue-50) */
        tr:nth-child(even) td.sticky-bg-solid {
          background-color: #eff6ff !important; 
        }
        
        /* 表体背景 - 鼠标悬停 (Tailwind blue-100) - 优先级最高 */
        tr:hover td.sticky-bg-solid {
          background-color: #dbeafe !important; 
        }

        /* --- 4. 定位与视觉分割 --- */
        
        /* 联系人列 (最左边的固定列) */
        .sticky-right-contact {
          right: 150px !important;
          border-left: 1px solid #cbd5e1 !important; /* 左侧实体分割线 */
          box-shadow: -6px 0 10px -4px rgba(0,0,0,0.15); /* 左侧投影，营造悬浮感 */
        }
        
        /* 催单列 */
        .sticky-right-remind {
          right: 70px !important;
        }
        
        /* 操作列 */
        .sticky-right-action {
          right: 0px !important;
        }
      `}</style>
      <div className="max-w-[1800px] mx-auto w-full flex-1 flex flex-col h-full">
        
        <NotificationBar />
        
        <DataOverview isSearchOpen={isSearchOpen} onToggleSearch={() => setIsSearchOpen(!isSearchOpen)} />
        
        {/* SearchPanel only displays content, toggle control is outside now but we pass it just in case or for closing */}
        <SearchPanel isOpen={isSearchOpen} onToggle={() => setIsSearchOpen(!isSearchOpen)} />

        {/* Pass toggle function and state to ActionBar */}
        <ActionBar 
          onRecord={() => setIsRecordModalOpen(true)} 
        />
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="overflow-x-auto flex-1 overflow-y-auto relative">
            <table className="w-full text-left border-collapse relative">
              <thead className="sticky top-0 z-40 shadow-sm">
                <tr className="bg-slate-50 border-b-2 border-gray-300 text-base font-bold uppercase text-slate-700 tracking-wider">
                  <th className="px-2 py-2 whitespace-nowrap w-[110px] bg-slate-50 text-center sticky top-0 z-30">手机号</th>
                  <th className="px-2 py-2 w-[140px] whitespace-nowrap bg-slate-50 sticky top-0 z-30">项目/质保期</th>
                  <th className="px-2 py-2 whitespace-nowrap w-[90px] bg-slate-50 text-center sticky top-0 z-30">状态</th>
                  {/* Moved Source column after Status */}
                  <th className="px-2 py-2 whitespace-nowrap w-[70px] bg-slate-50 text-center sticky top-0 z-30">来源</th>

                  {/* REMOVED: 系数, 建议分成, 建议方式, 划线价, 历史价, 资源, 是否有券, 是否验券, 是否已读, 是否拨打, 师傅/手机号, 垫付金额, 其他收款, 完工收入 */}
                  <th className="px-2 py-2 whitespace-nowrap min-w-[120px] bg-slate-50 text-center sticky top-0 z-30">地域</th>
                  <th className="px-2 py-2 max-w-[120px] whitespace-nowrap bg-slate-50 sticky top-0 z-30">详细地址</th> 
                  <th className="px-2 py-2 max-w-[140px] whitespace-nowrap bg-slate-50 sticky top-0 z-30">详情</th>
                  
                  <th className="px-2 py-2 whitespace-nowrap w-[160px] bg-slate-50 sticky top-0 z-30">订单/工单号</th>
                  <th className="px-2 py-2 whitespace-nowrap w-[110px] bg-slate-50 sticky top-0 z-30">录单/上门</th>

                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">质保期</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">工作机</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">客户姓名</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">派单员</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">录单员</th>
                  
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">总收款</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">成本</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">业绩</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">实付金额</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">服务时间</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">完成时间</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">收款时间</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">作废人/原因</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 sticky top-0 z-30 max-w-[150px]">作废详情</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 sticky top-0 z-30 max-w-[150px]">取消原因/详情</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 sticky top-0 z-30 max-w-[150px]">收藏备注</th>

                  {/* --- 固定列 (联系人, 催单, 操作) --- */}
                  <th className="px-2 py-2 whitespace-nowrap text-center min-w-[200px] w-[200px] sticky-th-solid sticky-col sticky-right-contact">联系人</th>
                  <th className="px-2 py-2 whitespace-nowrap text-center w-[80px] sticky-th-solid sticky-col sticky-right-remind border-l border-gray-200">催单</th> 
                  <th className="px-2 py-2 text-center sticky-th-solid sticky-col sticky-right-action whitespace-nowrap w-[70px] border-l border-gray-200">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {currentData.map((order, index) => (
                  <tr key={order.id} onMouseLeave={handleMouseEnterOther} className="bg-white even:bg-blue-50 hover:!bg-blue-100 transition-colors group border-b border-gray-300 last:border-0 align-middle">
                    
                    {/* 手机号: 增加字号 */}
                    <td className="px-2 py-2 text-slate-800 font-bold text-[12px] tabular-nums whitespace-nowrap align-middle text-center" onMouseEnter={handleMouseEnterOther}>{order.mobile}</td>
                    
                    {/* 服务项目: 增加字号 */}
                    <td className="px-2 py-2 align-middle whitespace-nowrap" onMouseEnter={handleMouseEnterOther}>
                      <ServiceItemCell item={order.serviceItem} warranty={order.warrantyPeriod} />
                    </td>
                    
                    <td className="px-2 py-2 align-middle" onMouseEnter={() => setHoveredTooltipCell({rowId: order.id, colKey: 'service'})}>
                      <StatusCell order={order} />
                    </td>

                    {/* Moved Source cell here */}
                    <td className="px-2 py-2 align-middle text-center" onMouseEnter={handleMouseEnterOther}><span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[11px] border border-slate-200 whitespace-nowrap font-medium">{order.source}</span></td>

                    {/* REMOVED: Coefficient td */}
                    
                    {/* 地域: 不变 */}
                    <td className="px-2 py-2 text-slate-700 whitespace-nowrap align-middle text-center text-[12px]" onMouseEnter={handleMouseEnterOther}>
                        <div className="relative pr-8 inline-block"> 
                            {order.region}
                            <span className="absolute bottom-0 right-0 text-[9px] text-blue-600 border border-blue-200 bg-blue-50 px-1 rounded">
                              {order.regionPeople}人
                            </span>
                        </div>
                    </td>
                    
                    {/* 详细地址: 不变 */}
                    <td className="px-2 py-2 align-middle" onMouseEnter={() => setHoveredTooltipCell({rowId: order.id, colKey: 'address'})}>
                      <TooltipCell content={order.address} maxWidthClass="max-w-[120px]" showTooltip={hoveredTooltipCell?.rowId === order.id && hoveredTooltipCell?.colKey === 'address'} />
                    </td>
                    
                    {/* 详情: 不变 */}
                    <td className="px-2 py-2 align-middle" onMouseEnter={() => setHoveredTooltipCell({rowId: order.id, colKey: 'details'})}>
                      <TooltipCell content={order.details} maxWidthClass="max-w-[140px]" showTooltip={hoveredTooltipCell?.rowId === order.id && hoveredTooltipCell?.colKey === 'details'} />
                    </td>
                    
                    {/* REMOVED: ServiceRatio, SuggestedMethod, GuidePrice, HistoricalPrice */}
                    
                    {/* 订单/工单号: 不变 */}
                    <td className="px-2 py-2 align-middle" onMouseEnter={handleMouseEnterOther}>
                        <CombinedIdCell orderNo={order.orderNo} workOrderNo={order.workOrderNo} hasAdvancePayment={order.hasAdvancePayment} depositAmount={order.depositAmount} />
                    </td>

                    {/* 录单/上门时间: 不变 */}
                    <td className="px-2 py-2 align-middle" onMouseEnter={handleMouseEnterOther}>
                        <CombinedTimeCell recordTime={order.recordTime} dispatchTime={order.dispatchTime} />
                    </td>

                    {/* REMOVED: Resource, HasCoupon, IsCouponVerified, IsRead, IsCalled */}
                    
                    {/* 增加字号 */}
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-slate-600 text-[13px]">{order.warrantyPeriod}</td>
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-slate-600 text-[13px]">{order.workPhone}</td>
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-slate-700 font-medium text-[13px]">{order.customerName}</td>
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-slate-600 text-[13px]">{order.dispatcherName}</td>
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-slate-600 text-[13px]">{order.recorderName}</td>
                    
                    {/* REMOVED: Master/Phone */}
                    
                    {/* 增加字号 */}
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap font-mono text-emerald-600 font-bold text-[13px]">{formatCurrency(order.totalReceipt)}</td>
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap font-mono text-slate-500 text-[13px]">{formatCurrency(order.cost)}</td>
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap font-mono text-orange-600 font-bold text-[13px]">{formatCurrency(order.revenue)}</td>
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap font-mono text-slate-700 text-[13px]">{formatCurrency(order.actualPaid)}</td>
                    {/* REMOVED: AdvancePayment, OtherReceipt, CompletionIncome */}
                    
                    {/* 时间列: 增加字号 */}
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-[12px] text-slate-500">{order.serviceTime || '-'}</td>
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-[12px] text-slate-500">{order.completionTime || '-'}</td>
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-[12px] text-slate-500">{order.paymentTime || '-'}</td>
                    
                    {/* 增加字号 */}
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-slate-500 text-[12px]">{order.voiderNameAndReason || '-'}</td>
                    <td className="px-2 py-2 align-middle whitespace-nowrap"><TooltipCell content={order.voidDetails || '-'} maxWidthClass="max-w-[150px]" showTooltip={false} /></td>
                    <td className="px-2 py-2 align-middle whitespace-nowrap"><TooltipCell content={order.cancelReasonAndDetails || '-'} maxWidthClass="max-w-[150px]" showTooltip={false} /></td>
                    <td className="px-2 py-2 align-middle whitespace-nowrap text-slate-500 text-[12px]">{order.favoriteRemark || '-'}</td>


                    {/* --- 固定列 (联系人, 催单, 操作) --- */}
                    <td className="px-2 py-2 align-middle text-center sticky-col sticky-right-contact sticky-bg-solid" onMouseEnter={handleMouseEnterOther}>
                      <div className="grid grid-cols-2 gap-2 p-1 w-full">
                        <button onClick={() => handleOpenChat('派单员', order)} className="text-[11px] w-full py-1 px-1 rounded border border-slate-300 bg-white hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap font-medium shadow-sm">派单员</button>
                        <button onClick={() => handleOpenChat('运营', order)} className="text-[11px] w-full py-1 px-1 rounded border border-slate-300 bg-white hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap font-medium shadow-sm">运营</button>
                        <button onClick={() => handleOpenChat('售后', order)} className="text-[11px] w-full py-1 px-1 rounded border border-slate-300 bg-white hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap font-medium shadow-sm">售后</button>
                        <button onClick={() => handleOpenChat('群聊', order)} className="text-[11px] w-full py-1 px-1 rounded border border-slate-300 bg-white hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap font-medium shadow-sm">群聊</button>
                      </div>
                    </td>
                    <td className="px-2 py-2 align-middle text-center sticky-col sticky-right-remind sticky-bg-solid border-l border-gray-200" onMouseEnter={handleMouseEnterOther}><ReminderCell order={order} onRemind={handleRemindOrder} /></td>
                    <td className="px-2 py-2 text-center sticky-col sticky-right-action sticky-bg-solid whitespace-nowrap border-l border-gray-200"><ActionCell orderId={order.id} onAction={handleAction} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* --- 分页栏重构: 居中显示 --- */}
          <div className="bg-white px-6 py-3 border-t border-gray-200 mt-auto">
             <Pagination 
                total={totalItems} 
                current={currentPage} 
                pageSize={pageSize} 
                onPageChange={setCurrentPage}
                onSizeChange={setPageSize}
             />
          </div>
        </div>
      </div>
      <RecordOrderModal isOpen={isRecordModalOpen} onClose={() => setIsRecordModalOpen(false)} />
      <CompleteOrderModal isOpen={completeModalOpen} onClose={() => setCompleteModalOpen(false)} order={currentOrder} />
      <ChatModal isOpen={chatState.isOpen} onClose={() => setChatState(prev => ({ ...prev, isOpen: false }))} role={chatState.role} order={chatState.order} />
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const appRoot = createRoot(container);
  appRoot.render(<App />);
}