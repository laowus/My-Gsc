import { KINDS, DYNASTYS } from "../common/utils";

class Writer {
  constructor(writerid, writername, dynastyid, summary = "", infos = []) {
    this.writerid = writerid;
    this.writername = writername;
    this.dynastyid = dynastyid;
    this.dynastyname = DYNASTYS[dynastyid];
    this.summary = summary;
    this.infos = infos;
  }
}
export default Writer;
