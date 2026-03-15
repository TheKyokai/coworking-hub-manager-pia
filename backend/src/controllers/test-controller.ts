import express from 'express'

class TestController 
{
    async test(req: express.Request, res: express.Response)
    {
        res.send("Test successful!")
    }

}


const testController = new TestController()
export default testController