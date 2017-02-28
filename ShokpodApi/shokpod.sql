USE [mcshist]
GO

/****** Object: Table [dbo].[MAC_ACC_MONITORING_SHOKPOD_EVENTS] Script Date: 1/03/2017 12:08:20 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

DROP TABLE [dbo].[MAC_ACC_MONITORING_SHOKPOD_EVENTS];


GO
CREATE TABLE [dbo].[MAC_ACC_MONITORING_SHOKPOD_EVENTS] (
    [Id]            UNIQUEIDENTIFIER NOT NULL,
    [event_time]    VARCHAR (50)     NOT NULL,
    [operator]      VARCHAR (50)     NOT NULL,
    [acc_x]         FLOAT (53)       NOT NULL,
    [acc_y]         FLOAT (53)       NOT NULL,
    [acc_z]         FLOAT (53)       NOT NULL,
    [acc_total]     FLOAT (53)       NOT NULL,
    [alert_level]   INT              NOT NULL,
    [application]   INT              NULL,
    [prodmon_state] INT              NULL,
    [device_id]     VARCHAR (50)     NOT NULL
);
