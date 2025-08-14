import Poems from "../views/Poems.vue";
import Writers from "../views/Writers.vue";
import Rhesis from "../views/Rhesis.vue";
import Types from "../views/Types.vue";
import My from "../views/My.vue";
import Setting from "../views/Setting.vue";
//体裁
const KINDS = ["不限", "诗", "词", "曲", "文言文", "辞赋"];
//朝代
const DYNASTYS = ["不限", "先秦", "两汉", "魏晋", "南北朝", "隋代", "初唐", "盛唐", "中唐", "晚唐", "五代", "北宋", "南宋", "金朝", "元代", "明代", "清代", "近现代"];

const VIEWS = [Poems, Writers, Types, Rhesis, My, Setting];

export { KINDS, DYNASTYS, VIEWS };
