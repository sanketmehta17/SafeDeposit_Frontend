/* Author: Dhrumil Amish Shah (B00857606) */
import React, { useState, useEffect } from 'react';
import AWS from 'aws-sdk';
import { CssBaseline, Grid, Paper, TextField, Typography, Button, CircularProgress, Card, CardContent } from '@material-ui/core';
import { useLocation, Link } from 'react-router-dom';
import { publishMessage, pullDelivery } from '../../apis/MessagePassingAPIs';
import useStyles from './styles';


AWS.config.update({
    region: process.env.REACT_APP_AWS_REGION,
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY,
    sessionToken: process.env.REACT_APP_AWS_SESSION_TOKEN,
});

const documentClient = new AWS.DynamoDB.DocumentClient();

export const Home = () => {
    const [messageData, setMessageData] = useState({ message: '' });
    const [messageData1, setMessageData1] = useState({ message1: '' });
    const [messagesReceived, setMessagesReceived] = useState([]);
    const [errors, setErrors] = useState({ messageValid: false });
    const userReceivedProps = useLocation().state;
    // const safeDepositReceivedProps = safeDepositBalance;
    const classes = useStyles();

    useEffect(() => {
        pullMessages();
    }, []);

    

    const pullMessages = async () => {
        const safeDepositId = userReceivedProps.safeDepositId;
        const emailId = userReceivedProps.email;
        const sameSafeDepositUsers = {
            TableName: "user",
            FilterExpression: "#safeDepositId = :safeDepositId and not #emailId = :emailId",
            ExpressionAttributeNames: {
                "#safeDepositId": "safeDepositId",
                "#emailId": "email",
            },
            ExpressionAttributeValues: {
                ":safeDepositId": safeDepositId,
                ":emailId": emailId,
            }
        };

        const sameSafeDepositUsersData = await documentClient.scan(sameSafeDepositUsers).promise();
        var msgs = [...messagesReceived];
        for (var i = 0; i < sameSafeDepositUsersData.Items.length; ++i) {
            const userData = {};
            userData["topicName"] = sameSafeDepositUsersData["Items"][i].topicName;
            userData["userId"] = userReceivedProps.userId;
            const receivedMessagesData = await pullDelivery(userData);
            msgs = msgs.concat(receivedMessagesData.data.payload);
        }
        console.log(msgs);
        setMessagesReceived(msgs);
    };

    const fieldsValid = () => {
        if (errors.messageValid) {
            return true;
        } else {
            return false;
        }
    }

    const validate = (e) => {
        switch (e.target.name) {
            case 'message':
                if (e.target.value === "" || e.target.value === null) {
                    errors["message"] = "Message is required."
                    errors["messageValid"] = false;
                } else {
                    errors["message"] = "";
                    errors["messageValid"] = true;
                }
                break;
            default:
                break;
        }
        setErrors(errors);
    };

    const onChange = (e) => {
        validate(e);
        setMessageData({
            ...messageData,
            [e.target.name]: e.target.value
        });
    };

    const onChange1 = (e) => {
        validate(e);
        setMessageData1({
            ...messageData1,
            [e.target.name]: e.target.value
        });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (fieldsValid()) {
            const user = {}
            user["topicName"] = userReceivedProps.topicName;
            user["message"] = `${userReceivedProps.firstName} ${userReceivedProps.lastName}: ${messageData.message}`;
            const publishMessageData = await publishMessage(user);
            if (publishMessageData.data.success) {
                console.log("Message published successfully.");
                console.log(publishMessageData.data.message);
                setMessageData({ message: '' });
                setErrors({ messageValid: false });
            }
        }
    };

    const onSubmit1 = async (e) => {
        e.preventDefault();
        if (fieldsValid()) {
            const user = {}
            user["topicName"] = userReceivedProps.safeDepositId;
            user["message"] = `${userReceivedProps.firstName} ${userReceivedProps.lastName}: ${messageData.message}`;
        }
    };

    return (
        <Grid container component="main" className={classes.root}>
            <CssBaseline />
            <Grid item xs={12} sm={4} md={7}>
                <iframe title="Google Data Studio Charts" width="100%" height="70%" src="https://datastudio.google.com/embed/reporting/820b780c-573c-4232-a045-3d30bf5a7165/page/mjbhC" />
            </Grid>
            <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square className={classes.formBackground}>
                <div className={classes.paper}>
                    <Button className={classes.submit} color="secondary" variant="contained" type="submit">
                        <Link to={"/login1"} style={{ color: "#FFFFFF" }}>Logout</Link>
                    </Button>
  
                    <Typography component="h5" variant="h5" fontWeight="fontWeightBold">
                        Current Balance: 
                    </Typography>
                    <form onSubmit={onSubmit1} className={classes.form} noValidate>
                        <div className={classes.publishMessage}>Withdraw money from SafeDeposit Box: {userReceivedProps.safeDepositId}</div>
                        <TextField
                            fullWidth
                            margin="normal"
                            id="message1"
                            type="text"
                            name="message1"
                            label="Enter Amount"
                            variant="outlined"
                            required
                            value={messageData1.message}
                            onChange={onChange1}
                            error={errors["message1"] ? true : false}
                            helperText={errors["message1"]}
                        />
                        <Button className={classes.submit} color="secondary" variant="contained" fullWidth type="submit">
                            Withdraw Money
                        </Button>
                    </form>

                    <Typography component="h3" variant="h3" fontWeight="fontWeightBold">
                        Message Other Users
                    </Typography>
                    <form onSubmit={onSubmit} className={classes.form} noValidate>
                        <div className={classes.publishMessage}>Publish message to topic: {userReceivedProps.topicName}</div>
                        <TextField
                            fullWidth
                            margin="normal"
                            id="message"
                            type="text"
                            name="message"
                            label="Type your message here"
                            variant="outlined"
                            required
                            value={messageData.message}
                            onChange={onChange}
                            error={errors["message"] ? true : false}
                            helperText={errors["message"]}
                        />
                        <Button disabled={!fieldsValid()} className={classes.submit} color="secondary" variant="contained" fullWidth type="submit">
                            Publish Message From {userReceivedProps.firstName}
                        </Button>
                    </form>
                </div>
                {!messagesReceived.length ?
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography>Waiting for new messages ... :) </Typography>
                        <CircularProgress className={classes.circularProgress} /></div> :
                    (<Grid className={classes.container}
                        container alignItems="center"
                        spacing={1}>
                        {messagesReceived.map((messageReceived, index) => {
                            return <Grid item xs={12} sm={12} md={12} lg={12} key={index}>
                                <div style={{ marginLeft: "16px", marginRight: "16px" }}>
                                    <Card elevation={6} component={Paper}>
                                        <CardContent>
                                            <Typography sx={{ fontSize: 14 }} color="primary" gutterBottom>
                                                {messageReceived.split(':')[0]}
                                            </Typography>
                                            <Typography variant="h5" component="div">
                                                {messageReceived.split(':')[1]}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </div>
                            </Grid>
                        })}
                    </Grid>)}
            </Grid>
        </Grid>
    );
};