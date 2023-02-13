class Users {
    constructor(channel) {
        this.channel = channel;
    }

    async testApi(req, res) {
        try {
            res.status(200).json({
                success: true,
                message: `success ${this.channel}`,
            });
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    }
}

export default Users;
