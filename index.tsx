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
  ChevronRight,
  Edit,
  Receipt,
  Headset,
  MessageSquare,
  PhoneCall,
  Flag,
  Flame,
  CircleAlert
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
  score: string;           // 加分/扣分 (修改为字符串，支持 +2/-1 格式)
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
    
    // Score generation (Strict Rule: Every row has data. If deduction, must have bonus in front.)
    // Format: "+2" or "+2/-1"
    const bonus = Math.floor(Math.random() * 10) + 1; // Always have a bonus 1-10
    const hasDeduction = Math.random() > 0.5; // 50% chance of deduction
    let scoreStr = `+${bonus}`;
    if (hasDeduction) {
        const deduction = Math.floor(Math.random() * 5) + 1;
        scoreStr += `/-${deduction}`;
    }

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
      score: scoreStr
    };
  });
};

const FULL_MOCK_DATA = generateMockData();

// --- 组件定义 ---

const NotificationBar = () => {
  return (
    <div className="mb-3 bg-white rounded-lg px-4 py-2.5 flex items-center gap-4 overflow-hidden relative shadow-sm border border-slate-100">
      {/* Left Button */}
      <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1.5 shadow-sm shrink-0">
        <span>主要公告</span>
        <Bell size={12} className="fill-current" />
      </div>
      
      {/* Scrolling Content Area - 1 Hour Scroll */}
      <div className="flex-1 overflow-hidden relative h-6 group">
        <div className="absolute whitespace-nowrap animate-marquee group-hover:pause-animation text-xs text-slate-700 flex items-center h-full tracking-wide">
            {/* Item 1 */}
            <div className="flex items-center gap-2 mr-12">
                <Bell size={14} className="text-blue-500 fill-current" />
                <span>关于 2025 年度秋季职级晋升评审的通知：点击下方详情以阅读完整公告内容。</span>
            </div>
            
            {/* Item 2 */}
            <div className="flex items-center gap-2 mr-12">
                <CircleAlert size={14} className="text-orange-500 fill-current" />
                <Megaphone size={14} className="text-slate-700" />
                <span>系统升级通知：今晚 24:00 将进行系统维护。</span>
            </div>

            {/* Item 3 */}
            <div className="flex items-center gap-2 mr-12">
                <Flag size={14} className="text-red-500 fill-current" />
                <Flame size={14} className="text-orange-500 fill-orange-500" />
                <span>10月业绩pk赛圆满结束，恭喜华东大区获得冠军！</span>
            </div>
        </div>
      </div>
      
      {/* Right Date */}
      <div className="text-slate-400 text-xs px-2 py-1 bg-slate-50 rounded border border-slate-100 shrink-0 font-medium font-mono">
        2025-11-19
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 3600s linear infinite;
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
    <div className="mb-3 bg-white border border-slate-100 rounded-lg px-4 py-3 flex items-center justify-between shadow-sm">
       <div className="flex items-center gap-6 overflow-x-auto no-scrollbar flex-1 mr-4">
          <div className="flex items-center gap-2 pr-6 border-r border-slate-100 shrink-0">
             <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <Activity size={16} />
             </div>
             <span className="font-bold text-slate-800 text-sm">数据概览</span>
          </div>
          <div className="flex items-center gap-8 text-xs whitespace-nowrap">
             <div className="flex items-baseline gap-1.5"><span className="text-slate-500">录单数</span><span className="text-xl font-bold text-blue-600">156</span></div>
             <div className="flex items-baseline gap-1.5"><span className="text-slate-500">报错数</span><span className="text-xl font-bold text-red-500">12</span></div>
             
             {/* 3 Existing Score Items */}
             <div className="flex items-baseline gap-1.5"><span className="text-slate-500">当天分</span><span className="text-xl font-bold text-emerald-600">+85</span></div>
             <div className="flex items-baseline gap-1.5"><span className="text-slate-500">当月分</span><span className="text-xl font-bold text-emerald-600">+1240</span></div>
             <div className="flex items-baseline gap-1.5"><span className="text-slate-500">当天扣分</span><span className="text-xl font-bold text-red-500">-2</span></div>
             
             {/* 4 Existing Monthly Items */}
             <div className="flex items-baseline gap-1.5"><span className="text-slate-500">当月总录单数</span><span className="text-xl font-bold text-blue-600">3,420</span></div>
             <div className="flex items-baseline gap-1.5"><span className="text-slate-500">当月转化率</span><span className="text-xl font-bold text-green-600">68.5%</span></div>
             <div className="flex items-baseline gap-1.5"><span className="text-slate-500">当月目标录单数</span><span className="text-xl font-bold text-slate-800">5,000</span></div>
             <div className="flex items-baseline gap-1.5"><span className="text-slate-500">当月目标转化率</span><span className="text-xl font-bold text-slate-800">70%</span></div>

             {/* New 10th Item */}
             <div className="flex items-baseline gap-1.5"><span className="text-slate-500">当月目标咨询数差值</span><span className="text-xl font-bold text-orange-500">-128</span></div>
          </div>
       </div>
       
       <button 
          onClick={onToggleSearch}
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded hover:bg-slate-50 text-blue-500 transition-colors text-[10px] font-medium shrink-0"
        >
            <div className="w-6 h-6 rounded-full border border-blue-100 flex items-center justify-center bg-blue-50">
               <Search size={14} />
            </div>
            <span>高级筛选</span>
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
    <div className="shadow-sm mb-3 transition-all duration-300 ease-out relative rounded-lg border border-slate-200 bg-white px-5 py-4 animate-in fade-in slide-in-from-top-2">
       <div className="flex flex-col gap-3">
          
          {/* Grid Layout: 9 Columns */}
          <div className="grid grid-cols-9 gap-3">
              {/* --- ROW 1 (9 inputs) --- */}
              
              {/* 1. Order/Mobile/Customer */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">关键词</label>
                  <input type="text" className="h-8 w-full px-2 border border-slate-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white placeholder-slate-300" placeholder="订单号/手机/客户..." />
              </div>
              {/* 2. Extension */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">分机</label>
                  <input type="text" className="h-8 w-full px-2 border border-slate-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white placeholder-slate-300" placeholder="请输入..." />
              </div>
              {/* 3. Creator */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">创建人</label>
                  <input type="text" className="h-8 w-full px-2 border border-slate-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white placeholder-slate-300" placeholder="请输入..." />
              </div>
              {/* 4. Service Item */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">项目</label>
                  <input type="text" className="h-8 w-full px-2 border border-slate-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white placeholder-slate-300" placeholder="服务项目..." />
              </div>
              {/* 5. Region */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">地域</label>
                  <input type="text" className="h-8 w-full px-2 border border-slate-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white placeholder-slate-300" placeholder="请输入..." />
              </div>
              {/* 6. Status */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">状态</label>
                  <select className="h-8 w-full px-2 border border-slate-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white">
                    <option value="">全部</option><option value="PendingDispatch">待派单</option><option value="Completed">已完成</option>
                  </select>
              </div>
              {/* 7. Source */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">来源</label>
                  <select className="h-8 w-full px-2 border border-slate-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white">
                    <option value="">全部</option><option value="app">小程序</option><option value="phone">电话</option>
                  </select>
              </div>
               {/* 8. Dispatch Method */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">方式</label>
                  <select className="h-8 w-full px-2 border border-slate-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white">
                    <option value="">全部</option><option value="auto">系统</option><option value="manual">人工</option>
                  </select>
              </div>
               {/* 9. Is Replenishment */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">补款</label>
                  <select className="h-8 w-full px-2 border border-slate-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white">
                    <option value="">全部</option><option value="yes">是</option><option value="no">否</option>
                  </select>
              </div>

              {/* --- ROW 2 (Remaining 5 inputs + Time(3) + Buttons(1)) = 9 cols --- */}

              {/* 10. Work Phone */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">工作机</label>
                  <input type="text" className="h-8 w-full px-2 border border-slate-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white placeholder-slate-300" placeholder="请输入..." />
              </div>
              {/* 11. Dispatcher */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">派单员</label>
                  <input type="text" className="h-8 w-full px-2 border border-slate-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white placeholder-slate-300" placeholder="请输入..." />
              </div>
              {/* 12. Master */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">师傅</label>
                  <input type="text" className="h-8 w-full px-2 border border-slate-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white placeholder-slate-300" placeholder="请输入..." />
              </div>
              {/* 13. Offline Master Phone */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-[11px] text-slate-500 min-w-[44px] text-right leading-none">线下师傅<br/>手机</label>
                  <input type="text" className="h-8 w-full px-2 border border-slate-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white placeholder-slate-300" placeholder="请输入..." />
              </div>
              {/* 14. Cost Ratio */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">比例</label>
                  <input type="text" className="h-8 w-full px-2 border border-slate-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white placeholder-slate-300" placeholder="请输入..." />
              </div>

              {/* 15. Time Filter (Span 3 Cols) */}
              <div className="col-span-3 flex items-center gap-2">
                  <div className="relative shrink-0">
                    <select 
                      value={timeType}
                      onChange={(e) => setTimeType(e.target.value)}
                      className="h-8 pl-2 pr-6 border border-slate-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white font-medium text-slate-700 appearance-none cursor-pointer w-[80px]"
                    >
                      <option value="create">创建时间</option>
                      <option value="finish">完成时间</option>
                      <option value="payment">收款时间</option>
                      <option value="service">服务时间</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-2.5 text-slate-400 pointer-events-none"/>
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded px-2 h-8 flex-1">
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
      <span className="text-[11px] text-[#1890ff] bg-[#e6f7ff] px-1.5 rounded w-fit mt-0.5 border border-blue-100">
        质保: {warranty}
      </span>
    )}
  </div>
);

const StatusCell = ({ order }: { order: Order }) => {
  const statusColors = {
    [OrderStatus.PendingDispatch]: 'bg-[#fff7e6] text-[#fa8c16] border-[#ffd591]',
    [OrderStatus.Completed]: 'bg-green-50 text-green-600 border-green-100',
    [OrderStatus.Void]: 'bg-slate-50 text-slate-500 border-slate-200',
    [OrderStatus.Returned]: 'bg-red-50 text-red-600 border-red-100',
    [OrderStatus.Error]: 'bg-red-50 text-red-600 border-red-100',
  };
  return (
    <div className="flex flex-col gap-1">
       <span className={`px-2 py-0.5 rounded text-[11px] font-bold border w-fit whitespace-nowrap ${statusColors[order.status]}`}>
         {order.status}
       </span>
       {order.returnReason && <span className="text-[10px] text-red-500 leading-tight">{order.returnReason}</span>}
       {order.errorDetail && <span className="text-[10px] text-red-500 leading-tight">{order.errorDetail}</span>}
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

const CombinedIdCell = ({ orderNo, hasAdvancePayment, depositAmount }: { orderNo: string, hasAdvancePayment: boolean, depositAmount?: number }) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-1">
      <span className="text-[12px] text-slate-600">{orderNo}</span>
      <button className="text-slate-400 hover:text-blue-500"><Copy size={10} /></button>
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
            left: rect.left - 130 
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
             className="fixed z-[9999] w-36 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200"
             style={{ 
               top: menuPosition.top, 
               left: menuPosition.left 
             }}
           >
              <button onClick={() => { onAction('详情', orderId); setIsOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"><FileText size={14}/> 详情</button>
              <button onClick={() => { onAction('短信发送详情', orderId); setIsOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"><MessageCircle size={14}/> 短信发送详情</button>
              <button onClick={() => { onAction('修改', orderId); setIsOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"><Edit size={14}/> 修改</button>
              <button onClick={() => { onAction('催单', orderId); setIsOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"><Bell size={14}/> 催单</button>
              <button onClick={() => { onAction('开票', orderId); setIsOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"><Receipt size={14}/> 开票</button>
              <button onClick={() => { onAction('复制订单', orderId); setIsOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"><Copy size={14}/> 复制订单</button>
              <button onClick={() => { onAction('待办', orderId); setIsOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"><ClipboardList size={14}/> 待办</button>
              <button onClick={() => { onAction('特殊单', orderId); setIsOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"><AlertTriangle size={14}/> 特殊单</button>
              <button onClick={() => { onAction('新需求', orderId); setIsOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"><Zap size={14}/> 新需求</button>
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl w-[1100px] max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
         {/* Header */}
         <div className="flex items-center justify-between px-6 py-4 border-b">
           <h3 className="text-base font-bold text-slate-800">新增订单</h3>
           <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
         </div>
         
         {/* Body */}
         <div className="flex-1 overflow-y-auto p-6">
            <div className="flex gap-8">
                {/* Left Form Column */}
                <div className="flex-1 space-y-4">
                    {/* Service Item */}
                    <div className="flex items-center gap-3">
                        <label className="text-sm text-slate-600 w-20 text-right"><span className="text-red-500 mr-1">*</span>服务项目</label>
                        <input type="text" className="flex-1 h-9 px-3 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-300" placeholder="请输入关键词搜索" />
                        <label className="text-sm text-slate-600 whitespace-nowrap ml-2">质保期：</label>
                        <span className="text-sm text-slate-500">展示质保期</span>
                    </div>
                    
                    {/* Region */}
                    <div className="flex items-center gap-3">
                        <label className="text-sm text-slate-600 w-20 text-right"><span className="text-red-500 mr-1">*</span>地域</label>
                        <input type="text" className="flex-1 h-9 px-3 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-300" placeholder="请输入关键词搜索" />
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-3">
                        <label className="text-sm text-slate-600 w-20 text-right mt-2"><span className="text-red-500 mr-1">*</span>地址</label>
                        <textarea className="flex-1 h-16 px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-300 resize-none" placeholder="请输入内容"></textarea>
                    </div>

                    {/* Details */}
                    <div className="flex items-start gap-3">
                         <label className="text-sm text-slate-600 w-20 text-right mt-2">详情</label>
                         <textarea className="flex-1 h-16 px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-300 resize-none" placeholder="请输入详情"></textarea>
                    </div>

                    {/* NEW LAYOUT: Time Selection (Left) and 2x2 Grid (Right) */}
                    <div className="flex items-start gap-3">
                        <label className="text-sm text-slate-600 w-20 text-right mt-2">期望时间</label>
                        <div className="flex-1 flex gap-4">
                             {/* Left: Time Section */}
                             <div className="flex-1 border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-lg p-4 space-y-3">
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="timeType" className="text-blue-600 focus:ring-blue-500" defaultChecked />
                                        <span className="text-sm text-slate-700">尽快上门</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="timeType" className="text-blue-600 focus:ring-blue-500" />
                                        <span className="text-sm text-slate-700">先联系</span>
                                    </label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer min-w-[20px]">
                                        <input type="radio" name="timeType" className="text-blue-600 focus:ring-blue-500" />
                                        <span className="text-sm text-slate-700 font-medium whitespace-nowrap">希望日期：</span>
                                    </label>
                                    <div className="relative flex-1">
                                        <input type="date" className="w-full h-8 px-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500 text-slate-600" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-slate-700 font-medium whitespace-nowrap pl-7">希望时间：</span>
                                    <div className="flex items-center gap-2 flex-1">
                                        <input type="time" className="flex-1 h-8 px-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500 text-slate-600" placeholder="选择开始时段" />
                                        <span className="text-slate-400">-</span>
                                        <input type="time" className="flex-1 h-8 px-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500 text-slate-600" placeholder="选择结束时段" />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Right: 2x2 Grid (Mobile, Customer, Source, WorkPhone) */}
                            <div className="w-[320px] grid grid-cols-2 gap-3 shrink-0">
                                {/* Mobile */}
                                <div className="col-span-1 min-w-0">
                                    <div className="flex items-center border border-slate-300 rounded overflow-hidden h-9 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
                                        <div className="bg-slate-50 px-2 text-xs text-slate-500 border-r border-slate-200 h-full flex items-center shrink-0 w-12 justify-center">手机</div>
                                        <input type="text" className="w-full h-full px-2 text-sm focus:outline-none min-w-0" placeholder="号码" />
                                    </div>
                                </div>
                                {/* Customer */}
                                <div className="col-span-1 min-w-0">
                                    <div className="flex items-center border border-slate-300 rounded overflow-hidden h-9 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
                                        <div className="bg-slate-50 px-2 text-xs text-slate-500 border-r border-slate-200 h-full flex items-center shrink-0 w-12 justify-center">客户</div>
                                        <input type="text" className="w-full h-full px-2 text-sm focus:outline-none min-w-0" placeholder="姓名" />
                                    </div>
                                </div>
                                 {/* Source */}
                                <div className="col-span-1 min-w-0">
                                    <div className="flex items-center border border-slate-300 rounded overflow-hidden h-9 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
                                        <div className="bg-slate-50 px-2 text-xs text-slate-500 border-r border-slate-200 h-full flex items-center shrink-0 w-12 justify-center">来源</div>
                                        <select className="w-full h-full px-1 text-sm focus:outline-none bg-white text-slate-700 min-w-0 appearance-none cursor-pointer">
                                            <option>电话</option>
                                            <option>小程序</option>
                                        </select>
                                    </div>
                                </div>
                                 {/* WorkPhone */}
                                <div className="col-span-1 min-w-0">
                                    <div className="flex items-center border border-slate-300 rounded overflow-hidden h-9 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
                                        <div className="bg-slate-50 px-2 text-xs text-slate-500 border-r border-slate-200 h-full flex items-center shrink-0 w-12 justify-center">工作机</div>
                                        <input type="text" className="w-full h-full px-2 text-sm focus:outline-none min-w-0" placeholder="搜索" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image Upload Row */}
                    <div className="flex items-start gap-3">
                         <label className="text-sm text-slate-600 w-20 text-right mt-2">图片上传</label>
                         <div className="flex-1">
                            {!imagePreview ? (
                                <label className="border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-colors h-24 w-full">
                                    <Upload className="text-slate-400 mb-2" size={20} />
                                    <span className="text-xs text-slate-500">点击上传图片</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                            ) : (
                                <div className="relative w-fit group">
                                    <img src={imagePreview} alt="Preview" className="h-24 w-auto rounded border border-slate-200 object-cover" />
                                    <button 
                                        onClick={() => setImagePreview(null)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            )}
                         </div>
                    </div>
                </div>

                {/* Right Smart Recognition Column */}
                <div className="w-[300px] flex flex-col gap-4">
                    <textarea 
                        className="w-full h-40 border border-slate-300 rounded p-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-400 resize-none"
                        placeholder="在此粘贴或输入内容，自动识别手机号码、服务项目、地址等信息"
                    ></textarea>
                    
                    <div className="text-xs text-slate-400 space-y-3">
                        <p>例如：</p>
                        <p>【客】, iyang761227,13801109798，北京市海淀区，南四环.益桥附近，燃气灶维修，点不着火，上门费30，下单30，咨询</p>
                        <p>美团，18613313500，保定市竞秀区，建南街道，租摄影棚，未报价，27</p>
                        <p>线7，18729306628，陕西省西安市雁塔区，西安高新华府，打印机维修，小问题维修100，已加微信，定全30，住这儿</p>
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded transition-colors shadow-sm">自动识别</button>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <div className="relative inline-block w-8 h-4 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 checked:right-0 checked:border-blue-600"/>
                                <label htmlFor="toggle" className="toggle-label block overflow-hidden h-4 rounded-full bg-slate-300 cursor-pointer"></label>
                            </div>
                            <span className="text-xs text-slate-700 font-bold">自动获取价格</span>
                        </label>
                    </div>
                    
                    <div className="mt-2 text-sm text-slate-800 font-medium cursor-pointer hover:text-blue-600">
                        草稿暂存区
                    </div>
                </div>
            </div>
         </div>
         
         {/* Footer */}
         <div className="p-4 border-t bg-white flex justify-end gap-3 items-center">
            <button className="px-4 py-2 text-sm bg-[#84cc16] hover:bg-[#65a30d] text-white rounded transition-colors font-medium">存入草稿箱</button>
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors">取消</button>
            <button onClick={onClose} className="px-6 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 shadow-md transition-colors">确定</button>
         </div>
      </div>
      <style>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #2563eb;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #2563eb;
        }
      `}</style>
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
               <div className="flex justify-between"><span>服务金额:</span> <span className="font-bold font-mono">¥{order.totalAmount}</span></div>
               <div className="flex justify-between"><span>实际收款:</span> <span className="font-bold text-green-600 font-mono">¥{order.actualPaid}</span></div>
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
    <div className="h-screen bg-[#f0f2f5] p-3 flex flex-col overflow-hidden">
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
          background-color: #fafafa !important; /* slate-50 */
        }

        /* 表体背景 - 默认（奇数行） */
        tr td.sticky-bg-solid {
          background-color: #ffffff !important;
        }
        
        /* 表体背景 - 偶数行 (Tailwind blue-50) */
        tr:nth-child(even) td.sticky-bg-solid {
          background-color: #f8fafc !important; 
        }
        
        /* 表体背景 - 鼠标悬停 (Tailwind blue-100) - 优先级最高 */
        tr:hover td.sticky-bg-solid {
          background-color: #e6f7ff !important; 
        }

        /* --- 4. 定位与视觉分割 --- */
        
        /* 联系人列 (最左边的固定列) */
        /* Updated: Reduced right value to 110px and width logic to close gap */
        .sticky-right-contact {
          right: 110px !important;
          border-left: 1px solid #f0f0f0 !important; /* 左侧实体分割线 */
          box-shadow: -6px 0 10px -4px rgba(0,0,0,0.05); /* 左侧投影，营造悬浮感 */
        }
        
        /* 催单列 */
        /* Updated: Reduced right value to 50px */
        .sticky-right-remind {
          right: 50px !important;
        }
        
        /* 操作列 */
        /* Updated: Reduced right value to 0px */
        .sticky-right-action {
          right: 0px !important;
        }
      `}</style>
      <div className="w-full flex-1 flex flex-col h-full">
        
        <NotificationBar />
        
        <DataOverview isSearchOpen={isSearchOpen} onToggleSearch={() => setIsSearchOpen(!isSearchOpen)} />
        
        {/* SearchPanel only displays content, toggle control is outside now but we pass it just in case or for closing */}
        <SearchPanel isOpen={isSearchOpen} onToggle={() => setIsSearchOpen(!isSearchOpen)} />

        {/* Pass toggle function and state to ActionBar */}
        <ActionBar 
          onRecord={() => setIsRecordModalOpen(true)} 
        />
        
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="overflow-x-auto flex-1 overflow-y-auto relative">
            <table className="w-full text-left border-collapse relative">
              <thead className="sticky top-0 z-40 shadow-sm">
                <tr className="bg-[#fafafa] border-b border-slate-200 text-sm font-bold text-slate-600 tracking-wide">
                  <th className="px-2 py-3 whitespace-nowrap w-[110px] bg-[#fafafa] text-center sticky top-0 z-30 border-b border-[#cbd5e1]">手机号</th>
                  <th className="px-2 py-3 w-[140px] whitespace-nowrap bg-[#fafafa] sticky top-0 z-30 border-b border-[#cbd5e1]">项目/质保期</th>
                  <th className="px-2 py-3 whitespace-nowrap w-[90px] bg-[#fafafa] text-center sticky top-0 z-30 border-b border-[#cbd5e1]">状态</th>
                  {/* Moved Source column after Status */}
                  <th className="px-2 py-3 whitespace-nowrap w-[70px] bg-[#fafafa] text-center sticky top-0 z-30 border-b border-[#cbd5e1]">来源</th>

                  {/* REMOVED: 系数, 建议分成, 建议方式, 划线价, 历史价, 资源, 是否有券, 是否验券, 是否已读, 是否拨打, 师傅/手机号, 垫付金额, 其他收款, 完工收入 */}
                  <th className="px-2 py-3 whitespace-nowrap min-w-[120px] bg-[#fafafa] text-center sticky top-0 z-30 border-b border-[#cbd5e1]">地域</th>
                  <th className="px-2 py-3 max-w-[120px] whitespace-nowrap bg-[#fafafa] sticky top-0 z-30 border-b border-[#cbd5e1]">详细地址</th> 
                  <th className="px-2 py-3 max-w-[140px] whitespace-nowrap bg-[#fafafa] sticky top-0 z-30 border-b border-[#cbd5e1]">详情</th>
                  
                  <th className="px-2 py-3 whitespace-nowrap w-[160px] bg-[#fafafa] sticky top-0 z-30 border-b border-[#cbd5e1]">订单号</th>
                  <th className="px-2 py-3 whitespace-nowrap w-[110px] bg-[#fafafa] sticky top-0 z-30 border-b border-[#cbd5e1]">录单/上门</th>
                  
                  {/* New Column: 加分/扣分 */}
                  <th className="px-2 py-3 whitespace-nowrap w-[80px] bg-[#fafafa] text-center sticky top-0 z-30 border-b border-[#cbd5e1]">加分/扣分</th>

                  {/* REMOVED: Warranty Period column */}
                  <th className="px-2 py-3 whitespace-nowrap bg-[#fafafa] text-center sticky top-0 z-30 border-b border-[#cbd5e1]">工作机</th>
                  <th className="px-2 py-3 whitespace-nowrap bg-[#fafafa] text-center sticky top-0 z-30 border-b border-[#cbd5e1]">客户姓名</th>
                  <th className="px-2 py-3 whitespace-nowrap bg-[#fafafa] text-center sticky top-0 z-30 border-b border-[#cbd5e1]">派单员</th>
                  <th className="px-2 py-3 whitespace-nowrap bg-[#fafafa] text-center sticky top-0 z-30 border-b border-[#cbd5e1]">录单员</th>
                  
                  {/* REMOVED: Total Receipt, Cost, Revenue, Actual Paid */}

                  <th className="px-2 py-3 whitespace-nowrap bg-[#fafafa] text-center sticky top-0 z-30 border-b border-[#cbd5e1]">服务/派单</th>
                  {/* Moved Favorite Remark column here */}
                  <th className="px-2 py-3 whitespace-nowrap bg-[#fafafa] sticky top-0 z-30 max-w-[150px] border-b border-[#cbd5e1]">收藏备注</th>

                  <th className="px-2 py-3 whitespace-nowrap bg-[#fafafa] text-center sticky top-0 z-30 border-b border-[#cbd5e1]">完成时间</th>
                  <th className="px-2 py-3 whitespace-nowrap bg-[#fafafa] text-center sticky top-0 z-30 border-b border-[#cbd5e1]">收款时间</th>
                  <th className="px-2 py-3 whitespace-nowrap bg-[#fafafa] text-center sticky top-0 z-30 border-b border-[#cbd5e1]">作废人/原因</th>
                  <th className="px-2 py-3 whitespace-nowrap bg-[#fafafa] sticky top-0 z-30 max-w-[150px] border-b border-[#cbd5e1]">作废详情</th>
                  <th className="px-2 py-3 whitespace-nowrap bg-[#fafafa] sticky top-0 z-30 max-w-[150px] border-b border-[#cbd5e1]">取消原因/详情</th>
                  
                  {/* --- 固定列 (联系人, 催单, 操作) --- */}
                  {/* Reduced width from 120px to 85px (approx 30%) */}
                  <th className="px-2 py-3 whitespace-nowrap text-center min-w-[85px] w-[85px] sticky-th-solid sticky-col sticky-right-contact border-l border-slate-200 border-b border-[#cbd5e1]">联系人</th>
                  {/* Reduced width to 60px */}
                  <th className="px-2 py-3 whitespace-nowrap text-center w-[60px] sticky-th-solid sticky-col sticky-right-remind border-l border-slate-200 border-b border-[#cbd5e1]">催单</th> 
                  {/* Reduced width to 50px */}
                  <th className="px-2 py-3 text-center sticky-th-solid sticky-col sticky-right-action whitespace-nowrap w-[50px] border-l border-slate-200 border-b border-[#cbd5e1]">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentData.map((order, index) => (
                  <tr key={order.id} onMouseLeave={handleMouseEnterOther} className="bg-white hover:!bg-[#e6f7ff] transition-colors group align-middle">
                    
                    {/* 手机号: 增加字号 */}
                    <td className="px-2 py-3 text-slate-900 font-bold text-[13px] tabular-nums whitespace-nowrap align-middle text-center border-b border-[#cbd5e1]" onMouseEnter={handleMouseEnterOther}>{order.mobile}</td>
                    
                    {/* 服务项目: 增加字号 */}
                    <td className="px-2 py-3 align-middle whitespace-nowrap border-b border-[#cbd5e1]" onMouseEnter={handleMouseEnterOther}>
                      <ServiceItemCell item={order.serviceItem} warranty={order.warrantyPeriod} />
                    </td>
                    
                    <td className="px-2 py-3 align-middle border-b border-[#cbd5e1]" onMouseEnter={() => setHoveredTooltipCell({rowId: order.id, colKey: 'service'})}>
                      <StatusCell order={order} />
                    </td>

                    {/* Moved Source cell here */}
                    <td className="px-2 py-3 align-middle text-center border-b border-[#cbd5e1]" onMouseEnter={handleMouseEnterOther}><span className="px-2 py-0.5 bg-[#f5f5f5] text-[#8c8c8c] rounded text-[11px] border border-slate-200 whitespace-nowrap font-medium">{order.source}</span></td>

                    {/* REMOVED: Coefficient td */}
                    
                    {/* 地域: 不变 */}
                    <td className="px-2 py-3 text-slate-600 whitespace-nowrap align-middle text-center text-[12px] border-b border-[#cbd5e1]" onMouseEnter={handleMouseEnterOther}>
                        <div className="relative pr-8 inline-block"> 
                            {order.region}
                            <span className="absolute bottom-0 right-0 text-[10px] text-blue-500 bg-blue-50 px-1 rounded">
                              {order.regionPeople}人
                            </span>
                        </div>
                    </td>
                    
                    {/* 详细地址: 不变 */}
                    <td className="px-2 py-3 align-middle border-b border-[#cbd5e1]" onMouseEnter={() => setHoveredTooltipCell({rowId: order.id, colKey: 'address'})}>
                      <TooltipCell content={order.address} maxWidthClass="max-w-[120px]" showTooltip={hoveredTooltipCell?.rowId === order.id && hoveredTooltipCell?.colKey === 'address'} />
                    </td>
                    
                    {/* 详情: 不变 */}
                    <td className="px-2 py-3 align-middle border-b border-[#cbd5e1]" onMouseEnter={() => setHoveredTooltipCell({rowId: order.id, colKey: 'details'})}>
                      <TooltipCell content={order.details} maxWidthClass="max-w-[140px]" showTooltip={hoveredTooltipCell?.rowId === order.id && hoveredTooltipCell?.colKey === 'details'} />
                    </td>
                    
                    {/* REMOVED: ServiceRatio, SuggestedMethod, GuidePrice, HistoricalPrice */}
                    
                    {/* 订单/工单号: 不变 */}
                    <td className="px-2 py-3 align-middle border-b border-[#cbd5e1]" onMouseEnter={handleMouseEnterOther}>
                        <CombinedIdCell orderNo={order.orderNo} hasAdvancePayment={order.hasAdvancePayment} depositAmount={order.depositAmount} />
                    </td>

                    {/* 录单/上门时间: 不变 */}
                    <td className="px-2 py-3 align-middle border-b border-[#cbd5e1]" onMouseEnter={handleMouseEnterOther}>
                        <CombinedTimeCell recordTime={order.recordTime} dispatchTime={order.dispatchTime} />
                    </td>

                    {/* New Column: 加分/扣分 */}
                    <td className="px-2 py-3 align-middle text-center whitespace-nowrap font-bold text-[13px] border-b border-[#cbd5e1]">
                        {order.score.includes('/') ? (
                            <span>
                                <span className="text-emerald-500">{order.score.split('/')[0]}</span>
                                <span className="text-slate-300 mx-0.5">/</span>
                                <span className="text-red-500">{order.score.split('/')[1]}</span>
                            </span>
                        ) : (
                            <span className="text-emerald-500">{order.score}</span>
                        )}
                    </td>

                    {/* REMOVED: Resource, HasCoupon, IsCouponVerified, IsRead, IsCalled */}
                    
                    {/* REMOVED: Warranty Period column */}
                    <td className="px-2 py-3 align-middle text-center whitespace-nowrap text-slate-500 text-[12px] border-b border-[#cbd5e1]">{order.workPhone}</td>
                    <td className="px-2 py-3 align-middle text-center whitespace-nowrap text-slate-500 font-medium text-[12px] border-b border-[#cbd5e1]">{order.customerName}</td>
                    <td className="px-2 py-3 align-middle text-center whitespace-nowrap text-slate-500 text-[12px] border-b border-[#cbd5e1]">{order.dispatcherName}</td>
                    <td className="px-2 py-3 align-middle text-center whitespace-nowrap text-slate-500 text-[12px] border-b border-[#cbd5e1]">{order.recorderName}</td>
                    
                    {/* REMOVED: Master/Phone */}
                    
                    {/* REMOVED: Total Receipt, Cost, Revenue, Actual Paid columns */}
                    
                    {/* 时间列: 增加字号 & 增加派单时间 */}
                    <td className="px-2 py-3 align-middle text-center whitespace-nowrap text-[12px] text-slate-500 border-b border-[#cbd5e1]">
                        <div className="flex flex-col gap-1 items-center">
                            <span>{order.serviceTime || '-'}</span>
                            <span className="text-[11px] text-slate-400" title="派单时间">{order.dispatchTime}</span>
                        </div>
                    </td>

                    {/* Moved Favorite Remark column here */}
                    <td className="px-2 py-3 align-middle whitespace-nowrap text-slate-400 text-[12px] border-b border-[#cbd5e1]">{order.favoriteRemark || '-'}</td>

                    <td className="px-2 py-3 align-middle text-center whitespace-nowrap text-[12px] text-slate-500 border-b border-[#cbd5e1]">{order.completionTime || '-'}</td>
                    <td className="px-2 py-3 align-middle text-center whitespace-nowrap text-[12px] text-slate-500 border-b border-[#cbd5e1]">{order.paymentTime || '-'}</td>
                    
                    {/* 增加字号 */}
                    <td className="px-2 py-3 align-middle text-center whitespace-nowrap text-slate-500 text-[12px] border-b border-[#cbd5e1]">{order.voiderNameAndReason || '-'}</td>
                    <td className="px-2 py-3 align-middle whitespace-nowrap border-b border-[#cbd5e1]"><TooltipCell content={order.voidDetails || '-'} maxWidthClass="max-w-[150px]" showTooltip={false} /></td>
                    <td className="px-2 py-3 align-middle whitespace-nowrap border-b border-[#cbd5e1]"><TooltipCell content={order.cancelReasonAndDetails || '-'} maxWidthClass="max-w-[150px]" showTooltip={false} /></td>


                    {/* --- 固定列 (联系人, 催单, 操作) --- */}
                    <td className="px-2 py-3 align-middle text-center sticky-col sticky-right-contact sticky-bg-solid border-l border-slate-200 border-b border-[#cbd5e1]" onMouseEnter={handleMouseEnterOther}>
                      <div className="flex items-center justify-center gap-2 w-full">
                        <button onClick={() => handleOpenChat('派单员', order)} className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-sm" title="派单员">
                           <Headset size={14} />
                        </button>
                        <button onClick={() => handleOpenChat('运营', order)} className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors shadow-sm" title="运营">
                           <User size={14} />
                        </button>
                        <button onClick={() => handleOpenChat('售后', order)} className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-sm" title="售后">
                           <MessageSquare size={14} />
                        </button>
                        <button onClick={() => handleOpenChat('群聊', order)} className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center hover:bg-purple-600 transition-colors shadow-sm" title="群聊">
                           <PhoneCall size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-2 py-3 align-middle text-center sticky-col sticky-right-remind sticky-bg-solid border-l border-slate-100 border-b border-[#cbd5e1]" onMouseEnter={handleMouseEnterOther}><ReminderCell order={order} onRemind={handleRemindOrder} /></td>
                    <td className="px-2 py-3 text-center sticky-col sticky-right-action sticky-bg-solid whitespace-nowrap border-l border-slate-100 border-b border-[#cbd5e1]"><ActionCell orderId={order.id} onAction={handleAction} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* --- 分页栏重构: 居中显示 --- */}
          <div className="bg-white px-6 py-3 border-t border-slate-200 mt-auto">
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