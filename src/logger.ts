import chalk from 'chalk';

declare global
{
    interface Console 
    {
        success (value:any) : void;
        fatal (value:any) : void;
    }
}

var cacheLog = console.log;
var cacheInfo = console.info;
var cacheWarn = console.warn;
var cacheError = console.error;

export function initLogger()
{
    console = { ...console, ...new Logger(undefined, 0)};
}

export default class Logger
{
    tag:any;

    static levels:{[name:string]:number} = {};

    constructor(type:any|undefined, minLevel:number = 1)
    {        
        if (!!type)
        {
            this.tag = `[${type}] `;
        }
        else
        {
            this.tag = '';
        }
        
        if (Logger.levels[this.tag] === undefined)
        {
            Logger.levels[this.tag] = minLevel;
        }
    }

    private formatLog(value:any)
    {
        if (value instanceof Object)
        {
            value.logger = this.tag;
            value.timestamp = Date.now();
        }
        else
        {
            value = new Date().toLocaleString() + ' - ' + this.tag + value;
        }

        return value;
    }

    thenTrace<T>(message:any) : (value:T)=>T
    {
        return (value:T) => { this.trace(message); return value; }; 
    }

    trace(value:any)
    {
        if (Logger.levels[this.tag] <= 0)
        {
            value = this.formatLog(value);

            cacheLog(chalk.gray(value));
        }
    }
    
    thenLog<T>(message:any) : (value:T)=>T
    {
        return (value:T) => { this.log(message); return value; }; 
    }

    log(value:any)
    {
        if (Logger.levels[this.tag] <= 1)
        {
            value = this.formatLog(value);

            cacheLog(chalk.gray(value));
        }
    }

    thenInfo<T>(message:any) : (value:T)=>T
    {
        return (value:T) => { this.info(message); return value; }; 
    }

    info(value:any)
    {
        if (Logger.levels[this.tag] <= 2)
        {
            value = this.formatLog(value);

            cacheInfo(value);
        }
    }

    thenSuccess<T>(message:any) : (value:T)=>T
    {
        return (value:T) => { this.success(message); return value; }; 
    }

    success(value:any)
    {
        if (Logger.levels[this.tag] <= 3)
        {
            value = this.formatLog(value);

            cacheInfo(chalk.bold.green(value));
        }
    }

    thenWarn<T>(message:any) : (value:T)=>T
    {
        return (value:T) => { this.warn(message); return value; }; 
    }

    warn(value:any)
    {
        if (Logger.levels[this.tag] <= 3)
        {
            value = this.formatLog(value);

            cacheWarn(chalk.yellow(value));
        }
    }
    
    thenError<T>(message:any) : (value:T)=>T
    {
        return (value:T) => { this.error(message); return value; }; 
    }

    error(value:any)
    {
        if (Logger.levels[this.tag] <= 4)
        {
            value = this.formatLog(value);

            cacheError(chalk.bold.red(value));
        }
    }
    
    thenFatal<T>(message:any) : (value:T)=>T
    {
        return (value:T) => { this.fatal(message); return value; }; 
    }

    fatal(value:any)
    {
        value = this.formatLog(value);

        cacheError(chalk.bold.bgRed(value));
    }
}