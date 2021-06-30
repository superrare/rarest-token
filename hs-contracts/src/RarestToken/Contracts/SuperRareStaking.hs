{-# LANGUAGE DataKinds             #-}
{-# LANGUAGE DeriveGeneric         #-}
{-# LANGUAGE FlexibleInstances     #-}
{-# LANGUAGE MultiParamTypeClasses #-}
{-# LANGUAGE OverloadedStrings     #-}
{-# LANGUAGE QuasiQuotes           #-}

module RarestToken.Contracts.SuperRareStaking where

import           Network.Ethereum.Contract.TH

[abiFrom|contracts/abis/SuperRareStaking.json|]