import { KINDS } from "../common/utils";

/**
 * 诗词
 */
class Poetry {
  constructor(poetryid, typeid, kindid, writer, title, content, infos = []) {
    this.poetryid = poetryid;
    this.typeid = typeid;
    this.kindid = kindid;
    this.kindname = KINDS[kindid];
    this.writer = writer;
    this.title = title;
    this.content = content;
    this.infos = infos;
  }
}
export default Poetry;
