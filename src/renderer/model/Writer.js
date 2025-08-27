import { KINDS, DYNASTYS } from "../common/utils";

class Writer {
  constructor(writerid, writername, dynastyid, summary = "", infos = [], isdel = 0) {
    this.writerid = writerid;
    this.writername = writername;
    this.dynastyid = dynastyid;
    this.dynastyname = DYNASTYS[dynastyid];
    this.summary = summary;
    this.infos = infos;
    this.isdel = isdel;
  }
}
export default Writer;
