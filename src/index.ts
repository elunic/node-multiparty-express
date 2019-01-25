import * as Debug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as fs from 'fs-extra';
import * as multiparty from 'multiparty';

const debug = Debug('multiparty-express');

declare namespace multipartyExpress {
  // Fixed File interface from multiparty [wh]
  interface File extends multiparty.File {
    /**
     * FIXED: the filename that the user reports for the file
     */
    originalFilename: string;
  }

  interface Files {
    [key: string]: File[];
  }

  interface Fields {
    /* tslint:disable-next-line:no-any */ // @ts-ignore
    [key: string]: any[];
  }
}

declare global {
  namespace Express {
    interface Request {
      fields: multipartyExpress.Fields;
      files: multipartyExpress.Files;
    }
  }
}

export default multipartyExpress;
export function multipartyExpress() {
  return function multipartyExpress(req: Request, res: Response, next: NextFunction) {
    try {
      new multiparty.Form().parse(req, (err, fields, files) => {
        if (err) {
          next(err);
        } else {
          req.fields = fields;
          req.files = files;
          next();
        }
      });
    } catch (err) {
      next(err);
    }
  };
}

export async function cleanup(req: Request) {
  if (req.files) {
    try {
      await Promise.all(
        Object.keys(req.files).map(async fieldname => {
          await Promise.all(
            req.files[fieldname].map(async file => {
              try {
                if (await fs.pathExists(file.path)) {
                  await fs.remove(file.path);
                }
              } catch (err) {
                debug(`Failed to cleanup file: ${file.path} (${file.originalFilename}`, err);
              }
            }),
          );
        }),
      );
    } catch (err) {
      debug(`Error cleaning up uploaded files`, err);
    }
  }
}
