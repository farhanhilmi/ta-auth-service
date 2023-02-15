class Users {
    constructor(channel) {
        this.channel = channel;
    }

    async testApi(req, res) {
        try {
            // const userData = JSON.parse(req.headers['user']);
            // console.log('user', req.headers['user']);
            const ababa = JSON.parse(req.header('user'));
            // const ababa = JSON.parse(req.header('user'));
            console.dir(ababa);
            // console.log(ababa.toString());
            // console.log('userData', req.header);
            res.status(200).json({
                success: true,
                message: `success ${this.channel}`,
            });
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    }

    // PROTECTED JWT TOKEN
    async testApiPost(req, res) {
        try {
            res.status(200).json({
                success: true,
                message: `success ${req.body.name}`,
            });
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    }
}

export default Users;
