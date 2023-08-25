class ExpressError extends Error{
        
    constructor(msg,errCode)
    {    super();
        this.msg=msg;
        this.errCode=errCode;
    }
}

module.exports=ExpressError;